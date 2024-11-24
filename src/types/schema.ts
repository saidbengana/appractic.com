export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
export type MediaType = 'IMAGE' | 'VIDEO'

export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SocialAccount {
  id: string
  userId: string
  platform: string
  accessToken: string
  refreshToken?: string | null
  platformUsername: string
  platformUserId: string
  avatar?: string | null
  isConnected: boolean
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title?: string | null
  content: string
  scheduledAt?: Date | null
  publishedAt?: Date | null
  status: PostStatus
  userId: string
  createdAt: Date
  updatedAt: Date
  versions?: PostVersion[]
  media?: PostMedia[]
}

export interface PostVersion {
  id: string
  postId: string
  accountId?: string | null
  content: {
    text: string
    media: PostMedia[]
  }
  createdAt: Date
  updatedAt: Date
  socialAccount?: SocialAccount | null
}

export interface PostMedia {
  id: string
  postId: string
  url: string
  type: MediaType
  thumbnail?: string | null
  aspectRatio?: number | null
  createdAt: Date
  updatedAt: Date
}

// API Request/Response Types
export interface CreatePostRequest {
  title?: string
  content: string
  scheduledAt?: string
  media?: {
    url: string
    type: MediaType
    thumbnail?: string
    aspectRatio?: number
  }[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  scheduledAt?: string | null
  status?: PostStatus
}

export interface CreatePostVersionRequest {
  postId: string
  accountId?: string
  content: {
    text: string
    media: {
      url: string
      type: MediaType
      thumbnail?: string
      aspectRatio?: number
    }[]
  }
}

export interface CreateSocialAccountRequest {
  platform: string
  accessToken: string
  refreshToken?: string
  platformUsername: string
  platformUserId: string
  avatar?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
