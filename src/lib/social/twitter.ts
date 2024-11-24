import { TwitterApi } from 'twitter-api-v2'
import { SOCIAL_CONFIG } from '@/config/social'
import { SocialAccount } from '@prisma/client'

export async function postToTwitter(content: string, mediaUrls: string[], account: SocialAccount) {
  try {
    const client = new TwitterApi(account.accessToken)
    const v2Client = client.v2

    // Upload media if present
    let mediaIds: string[] = []
    if (mediaUrls.length > 0) {
      const mediaPromises = mediaUrls.map(async (url) => {
        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        return client.v1.uploadMedia(Buffer.from(buffer), {
          mimeType: response.headers.get('content-type') || undefined
        })
      })
      mediaIds = await Promise.all(mediaPromises)
    }

    // Create tweet
    const tweet = await v2Client.tweet({
      text: content,
      media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
    })

    return tweet
  } catch (error) {
    console.error('Error posting to Twitter:', error)
    throw error
  }
}
