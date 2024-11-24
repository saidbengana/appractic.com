import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { schedulePost, cancelScheduledPost, getScheduledPosts } from '@/lib/bull-queue'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, mediaUrls, platform, accountId, scheduledTime } = await req.json()

    // Validate input
    if (!content || !platform || !accountId || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the social account
    const account = await db.socialAccount.findUnique({
      where: {
        id: accountId,
        userId
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      )
    }

    // Create schedule record in database
    const schedule = await db.schedule.create({
      data: {
        content,
        mediaUrls,
        platform,
        accountId,
        userId,
        scheduledTime: new Date(scheduledTime),
        status: 'SCHEDULED'
      }
    })

    // Add to queue
    const job = await schedulePost(
      platform,
      content,
      mediaUrls,
      account,
      new Date(scheduledTime)
    )

    // Update schedule with job ID
    await db.schedule.update({
      where: { id: schedule.id },
      data: { jobId: job.id.toString() }
    })

    return NextResponse.json({ schedule, jobId: job.id })
  } catch (error) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const scheduleId = searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    // Get schedule
    const schedule = await db.schedule.findUnique({
      where: {
        id: scheduleId,
        userId
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Cancel job in queue
    if (schedule.jobId) {
      await cancelScheduledPost(schedule.platform, schedule.jobId)
    }

    // Delete schedule from database
    await db.schedule.delete({
      where: { id: scheduleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Get scheduled posts from queue
    const scheduledPosts = await getScheduledPosts(platform)

    // Get corresponding database records
    const schedules = await db.schedule.findMany({
      where: {
        userId,
        platform,
        status: 'SCHEDULED'
      }
    })

    // Combine queue and database information
    const posts = schedules.map(schedule => {
      const queuedPost = scheduledPosts.find(post => post.id.toString() === schedule.jobId)
      return {
        ...schedule,
        queueStatus: queuedPost ? 'queued' : 'not_queued'
      }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error getting scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to get scheduled posts' },
      { status: 500 }
    )
  }
}
