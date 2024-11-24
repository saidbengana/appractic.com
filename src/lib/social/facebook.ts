import { FacebookApi } from 'fb'
import { SOCIAL_CONFIG } from '@/config/social'
import { SocialAccount } from '@prisma/client'

export async function postToFacebook(content: string, mediaUrls: string[], account: SocialAccount) {
  try {
    const fb = new FacebookApi({
      accessToken: account.accessToken,
      version: 'v17.0'
    })

    // If there are media files, create a media post
    if (mediaUrls.length > 0) {
      const attachments = await Promise.all(
        mediaUrls.map(async (url) => {
          const response = await fb.api('/me/photos', 'POST', {
            url,
            published: false
          })
          return { media_fbid: response.id }
        })
      )

      // Create post with media attachments
      const post = await fb.api('/me/feed', 'POST', {
        message: content,
        attached_media: attachments
      })

      return post
    } else {
      // Create text-only post
      const post = await fb.api('/me/feed', 'POST', {
        message: content
      })

      return post
    }
  } catch (error) {
    console.error('Error posting to Facebook:', error)
    throw error
  }
}
