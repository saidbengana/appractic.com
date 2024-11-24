import Bull from 'bull'
import { Platform, Post, Schedule, SocialAccount } from '@prisma/client'
import { prisma } from './prisma'
import { publishToSocialMedia } from './social'
import { Redis } from 'ioredis'
import { postToTwitter } from './social/twitter'
import { postToFacebook } from './social/facebook'
import { postToInstagram } from './social/instagram'
import { postToLinkedIn } from './social/linkedin'

interface PostJob {
  postId: string
  scheduleId: string
  platforms: Platform[]
}

// Initialize Redis connection with TLS for Upstash
const REDIS_URL = 'redis://default:Aaf2AAIjcDE0MWE1OTlmMDgxZDk0MTIwYjEzYzFjMjQ5NmUzYjAxN3AxMA@upright-lamprey-42998.upstash.io:6379'

const redis = new Redis(REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
})

// Create Bull queue
const queueOptions = {
  redis: REDIS_URL,
  prefix: 'bull',
  settings: {
    retryProcessDelay: 5000,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
}

const postQueue = new Bull<PostJob>('post-publishing', queueOptions)

// Process jobs
postQueue.process(async (job) => {
  const { postId, scheduleId, platforms } = job.data

  try {
    // Update schedule status to processing
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: 'PROCESSING' }
    })

    // Get post and social accounts
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new Error(`Post not found: ${postId}`)
    }

    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        platform: {
          in: platforms
        },
        user: {
          posts: {
            some: {
              id: postId
            }
          }
        }
      }
    })

    // Publish to each platform
    const results = await Promise.allSettled(
      socialAccounts.map(account => publishToSocialMedia(post, account))
    )

    // Check for errors
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message)

    if (errors.length > 0) {
      throw new Error(`Failed to publish to some platforms: ${errors.join(', ')}`)
    }

    // Update schedule status
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'COMPLETED',
        error: null
      }
    })

    // Update post status if all schedules are completed
    const remainingSchedules = await prisma.schedule.count({
      where: {
        postId,
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      }
    })

    if (remainingSchedules === 0) {
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'PUBLISHED' }
      })
    }
  } catch (error) {
    // Update schedule status on error
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: {
          increment: 1
        }
      }
    })

    throw error
  }
})

// Add job to queue
export async function schedulePost(schedule: Schedule & { post: Post }) {
  const delay = Math.max(0, new Date(schedule.scheduledAt).getTime() - Date.now())

  await postQueue.add(
    {
      postId: schedule.post.id,
      scheduleId: schedule.id,
      platforms: schedule.platforms
    },
    {
      delay,
      jobId: schedule.id
    }
  )
}

// Remove job from queue
export async function unschedulePost(scheduleId: string) {
  const job = await postQueue.getJob(scheduleId)
  if (job) {
    await job.remove()
  }
}

// Clean up completed and failed jobs
export async function cleanupJobs() {
  await postQueue.clean(24 * 60 * 60 * 1000, 'completed') // Remove completed jobs older than 24 hours
  await postQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed') // Remove failed jobs older than 7 days
}

// Graceful shutdown
export async function shutdown() {
  await postQueue.close()
  await redis.quit()
}

// Create queues for each platform with Upstash Redis configuration
const twitterQueue = new Bull('twitter-posts', queueOptions)
const facebookQueue = new Bull('facebook-posts', queueOptions)
const instagramQueue = new Bull('instagram-posts', queueOptions)
const linkedinQueue = new Bull('linkedin-posts', queueOptions)

// Process Twitter posts
twitterQueue.process(async (job) => {
  const { content, mediaUrls, account } = job.data
  return await postToTwitter(content, mediaUrls, account as SocialAccount)
})

// Process Facebook posts
facebookQueue.process(async (job) => {
  const { content, mediaUrls, account } = job.data
  return await postToFacebook(content, mediaUrls, account as SocialAccount)
})

// Process Instagram posts
instagramQueue.process(async (job) => {
  const { content, mediaUrls, account } = job.data
  return await postToInstagram(content, mediaUrls, account as SocialAccount)
})

// Process LinkedIn posts
linkedinQueue.process(async (job) => {
  const { content, mediaUrls, account } = job.data
  return await postToLinkedIn(content, mediaUrls, account as SocialAccount)
})

// Error handling for queues
const queues = [twitterQueue, facebookQueue, instagramQueue, linkedinQueue]
queues.forEach(queue => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error)
  })

  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} in queue ${queue.name} failed:`, error)
  })
})

export async function schedulePlatformPost(
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin',
  content: string,
  mediaUrls: string[],
  account: SocialAccount,
  scheduledTime: Date
) {
  const queue = {
    twitter: twitterQueue,
    facebook: facebookQueue,
    instagram: instagramQueue,
    linkedin: linkedinQueue
  }[platform]

  const job = await queue.add(
    {
      content,
      mediaUrls,
      account
    },
    {
      delay: scheduledTime.getTime() - Date.now(),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  )

  return job
}

export async function cancelScheduledPlatformPost(platform: string, jobId: string) {
  const queue = {
    twitter: twitterQueue,
    facebook: facebookQueue,
    instagram: instagramQueue,
    linkedin: linkedinQueue
  }[platform]

  const job = await queue.getJob(jobId)
  if (job) {
    await job.remove()
    return true
  }
  return false
}

export async function getScheduledPlatformPosts(platform: string) {
  const queue = {
    twitter: twitterQueue,
    facebook: facebookQueue,
    instagram: instagramQueue,
    linkedin: linkedinQueue
  }[platform]

  const jobs = await queue.getJobs(['delayed', 'waiting'])
  return jobs.map(job => ({
    id: job.id,
    data: job.data,
    scheduledTime: new Date(Date.now() + job.opts.delay!)
  }))
}
