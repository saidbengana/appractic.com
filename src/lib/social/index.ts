import { Post, Platform, SocialAccount } from '@prisma/client'
import { postToTwitter } from './twitter'
import { postToFacebook } from './facebook'
import { postToInstagram } from './instagram'
import { postToLinkedIn } from './linkedin'

export async function publishToSocialMedia(post: Post, account: SocialAccount): Promise<void> {
  const media = post.media ? JSON.parse(post.media as string) : []
  const mediaUrls = media.map((m: any) => m.url)

  switch (account.platform) {
    case Platform.TWITTER:
      await postToTwitter(post.content, mediaUrls, account)
      break
    case Platform.FACEBOOK:
      await postToFacebook(post.content, mediaUrls, account)
      break
    case Platform.INSTAGRAM:
      await postToInstagram(post.content, mediaUrls, account)
      break
    case Platform.LINKEDIN:
      await postToLinkedIn(post.content, mediaUrls, account)
      break
    default:
      throw new Error(`Unsupported platform: ${account.platform}`)
  }
}
