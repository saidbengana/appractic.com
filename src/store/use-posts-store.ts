import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface PostMedia {
  id: string
  url: string
  type: 'image' | 'video'
  thumbnail?: string
  aspectRatio?: number
}

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  alt?: string
}

export interface PostVersion {
  id: string
  accountId?: string
  content: {
    text: string
    media: PostMedia[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface SocialAccount {
  id: string
  platform: string
  username: string
  avatar?: string
  isConnected: boolean
}

export interface Post {
  id: string
  title: string
  content: string
  scheduledAt?: Date
  publishedAt?: Date
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  versions: PostVersion[]
  accounts: SocialAccount[]
  media?: MediaItem[]
  createdAt: Date
  updatedAt: Date
}

interface PostsState {
  posts: Post[]
  selectedPost: Post | null
  isLoading: boolean
  error: string | null
  // Actions
  setPosts: (posts: Post[]) => void
  setSelectedPost: (post: Post | null) => void
  addPost: (post: Post) => void
  updatePost: (id: string, post: Partial<Post>) => void
  deletePost: (id: string) => void
  addVersion: (postId: string, version: PostVersion) => void
  updateVersion: (postId: string, versionId: string, version: Partial<PostVersion>) => void
  deleteVersion: (postId: string, versionId: string) => void
  getPost: (id: string) => Post | undefined
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const usePostsStore = create<PostsState>()(
  devtools((set, get) => ({
    posts: [],
    selectedPost: null,
    isLoading: false,
    error: null,
    setPosts: (posts) => set({ posts }),
    setSelectedPost: (post) => set({ selectedPost: post }),
    addPost: (post) =>
      set((state) => ({ posts: [...state.posts, post] })),
    updatePost: (id, updatedPost) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id ? { ...post, ...updatedPost } : post
        ),
      })),
    deletePost: (id) =>
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      })),
    addVersion: (postId, version) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, versions: [...post.versions, version] }
            : post
        ),
      })),
    updateVersion: (postId, versionId, updatedVersion) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                versions: post.versions.map((version) =>
                  version.id === versionId
                    ? { ...version, ...updatedVersion }
                    : version
                ),
              }
            : post
        ),
      })),
    deleteVersion: (postId, versionId) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                versions: post.versions.filter(
                  (version) => version.id !== versionId
                ),
              }
            : post
        ),
      })),
    getPost: (id) => get().posts.find((post) => post.id === id),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    reset: () => set({ posts: [], selectedPost: null, isLoading: false, error: null }),
  }))
)

export const usePostStore = usePostsStore // Add alias for backward compatibility
