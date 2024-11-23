import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Post {
  id: string
  content: string
  scheduledDate?: Date
  platforms: string[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  media?: string[]
  createdAt: Date
  updatedAt: Date
}

interface PostsState {
  posts: Post[]
  isLoading: boolean
  error: string | null
  // Actions
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (id: string, post: Partial<Post>) => void
  deletePost: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePostsStore = create<PostsState>()(
  devtools((set) => ({
    posts: [],
    isLoading: false,
    error: null,
    setPosts: (posts) => set({ posts }),
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
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  }))
)
