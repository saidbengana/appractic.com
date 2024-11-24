import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import {
  twitterQueue,
  facebookQueue,
  instagramQueue,
  linkedinQueue
} from '@/lib/bull-queue'

// Process queued jobs
export async function GET() {
  try {
    // Verify request is from Vercel Cron
    const headersList = headers()
    const authHeader = headersList.get('Authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron authentication')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Start processing jobs for each queue
    await Promise.all([
      twitterQueue.process(),
      facebookQueue.process(),
      instagramQueue.process(),
      linkedinQueue.process()
    ])

    return NextResponse.json({
      status: 'Worker processing started',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Worker error:', error)
    return NextResponse.json(
      { error: 'Failed to start worker processing' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  return new Response(null, { status: 200 })
}
