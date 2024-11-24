import axios from 'axios'
import { SOCIAL_CONFIG } from '@/config/social'
import { SocialAccount } from '@prisma/client'

export async function postToLinkedIn(content: string, mediaUrls: string[], account: SocialAccount) {
  try {
    const api = axios.create({
      baseURL: 'https://api.linkedin.com/v2',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    // Create the share content
    const shareContent = {
      author: `urn:li:person:${account.accountId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    // Add media if present
    if (mediaUrls.length > 0) {
      const mediaAssets = await Promise.all(
        mediaUrls.map(async (url) => {
          // Register media upload
          const { data: uploadRequest } = await api.post('/assets?action=registerUpload', {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:person:${account.accountId}`,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent'
                }
              ]
            }
          })

          // Upload the media
          const response = await axios.get(url, { responseType: 'arraybuffer' })
          await axios.put(
            uploadRequest.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
            response.data,
            {
              headers: {
                'Content-Type': response.headers['content-type']
              }
            }
          )

          return {
            status: 'READY',
            media: uploadRequest.value.asset
          }
        })
      )

      shareContent.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets
    }

    // Create the post
    const { data: post } = await api.post('/ugcPosts', shareContent)

    return post
  } catch (error) {
    console.error('Error posting to LinkedIn:', error)
    throw error
  }
}
