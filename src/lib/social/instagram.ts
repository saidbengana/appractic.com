import FB from 'fb'
import { SOCIAL_CONFIG } from '@/config/social'
import { SocialAccount } from '@prisma/client'

export async function postToInstagram(content: string, mediaUrls: string[], account: SocialAccount) {
  try {
    FB.setAccessToken(account.accessToken)

    // Instagram requires at least one media for posts
    if (mediaUrls.length === 0) {
      throw new Error('Instagram posts require at least one media item')
    }

    // Create container
    const container = await new Promise((resolve, reject) => {
      FB.api(
        `/${account.accountId}/media`,
        'POST',
        {
          image_url: mediaUrls[0],
          caption: content,
        },
        (response: any) => {
          if (!response || response.error) {
            reject(response?.error || new Error('Failed to create media container'))
            return
          }
          resolve(response)
        }
      )
    })

    // Publish the container
    const post = await new Promise((resolve, reject) => {
      FB.api(
        `/${account.accountId}/media_publish`,
        'POST',
        {
          creation_id: (container as any).id
        },
        (response: any) => {
          if (!response || response.error) {
            reject(response?.error || new Error('Failed to publish media'))
            return
          }
          resolve(response)
        }
      )
    })

    return post
  } catch (error) {
    console.error('Error posting to Instagram:', error)
    throw error
  }
}
