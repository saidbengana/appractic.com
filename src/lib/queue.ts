import { prisma } from './prisma'
import { Platform, Post, Schedule, SocialAccount } from '@prisma/client'

interface PostWithSchedule extends Post {
  schedules: Schedule[]
  platforms: Platform[]
}

export class PostQueue {
  private static instance: PostQueue
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): PostQueue {
    if (!PostQueue.instance) {
      PostQueue.instance = new PostQueue()
    }
    return PostQueue.instance
  }

  public startProcessing(intervalMs: number = 60000) {
    if (this.processingInterval) {
      return
    }

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueue()
      }
    }, intervalMs)
  }

  public stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  private async processQueue() {
    try {
      this.isProcessing = true

      // Find schedules that are due and not yet processed
      const schedules = await prisma.schedule.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lte: new Date()
          }
        },
        include: {
          post: {
            include: {
              platforms: true
            }
          }
        }
      })

      for (const schedule of schedules) {
        await this.processSchedule(schedule)
      }
    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  private async processSchedule(schedule: Schedule & { post: PostWithSchedule }) {
    try {
      // Update schedule status to processing
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: 'PROCESSING' }
      })

      // Get social accounts for the post's platforms
      const socialAccounts = await prisma.socialAccount.findMany({
        where: {
          platform: {
            in: schedule.post.platforms
          },
          user: {
            posts: {
              some: {
                id: schedule.post.id
              }
            }
          }
        }
      })

      // Publish to each platform
      const results = await Promise.allSettled(
        socialAccounts.map(account => this.publishToSocialMedia(schedule.post, account))
      )

      // Check results and update schedule status
      const hasErrors = results.some(result => result.status === 'rejected')
      
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          status: hasErrors ? 'FAILED' : 'COMPLETED',
          error: hasErrors ? 'Failed to publish to some platforms' : null,
          attempts: {
            increment: 1
          }
        }
      })

      // Update post status if all schedules are completed
      const remainingSchedules = await prisma.schedule.count({
        where: {
          postId: schedule.post.id,
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        }
      })

      if (remainingSchedules === 0) {
        await prisma.post.update({
          where: { id: schedule.post.id },
          data: {
            status: hasErrors ? 'FAILED' : 'PUBLISHED'
          }
        })
      }
    } catch (error) {
      console.error('Error processing schedule:', error)
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          attempts: {
            increment: 1
          }
        }
      })
    }
  }

  private async publishToSocialMedia(post: Post, account: SocialAccount): Promise<void> {
    // Implement platform-specific publishing logic here
    switch (account.platform) {
      case 'TWITTER':
        // Implement Twitter posting
        break
      case 'FACEBOOK':
        // Implement Facebook posting
        break
      case 'INSTAGRAM':
        // Implement Instagram posting
        break
      case 'LINKEDIN':
        // Implement LinkedIn posting
        break
      default:
        throw new Error(`Unsupported platform: ${account.platform}`)
    }
  }
}

// Initialize the queue
export const postQueue = PostQueue.getInstance()

// Start processing in development (in production, use a proper job scheduler)
if (process.env.NODE_ENV === 'development') {
  postQueue.startProcessing()
}
