import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getUserFromSession } from '@/lib/api'
import { CreatePostRequest, UpdatePostRequest } from '@/types/schema'
import { ScheduleConfig } from '@/types/schedule'

interface PostData {
  title: string
  content: string
  media?: { url: string; type: string; thumbnail: string; aspectRatio: string }[]
  schedule?: ScheduleConfig
}

export async function GET() {
  try {
    const user = await getUserFromSession()
    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      include: {
        versions: {
          include: {
            socialAccount: true
          }
        },
        media: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse(posts)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch posts')
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const data: PostData = await request.json()

    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        userId: user.id,
        scheduledAt: data.schedule?.startDate,
        schedule: data.schedule ? JSON.stringify(data.schedule) : null,
        status: data.schedule ? 'SCHEDULED' : 'DRAFT',
        media: {
          create: data.media?.map(m => ({
            url: m.url,
            type: m.type,
            thumbnail: m.thumbnail,
            aspectRatio: m.aspectRatio
          }))
        }
      },
      include: {
        versions: true,
        media: true
      }
    })

    return successResponse(post)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to create post')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    
    if (!postId) {
      return errorResponse('Post ID is required')
    }

    const data: PostData & { id: string } = await request.json()

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: user.id }
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        scheduledAt: data.schedule?.startDate,
        schedule: data.schedule ? JSON.stringify(data.schedule) : null,
        status: data.schedule ? 'SCHEDULED' : 'DRAFT',
      },
      include: {
        versions: {
          include: {
            socialAccount: true
          }
        },
        media: true
      }
    })

    return successResponse(updatedPost)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to update post')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    
    if (!postId) {
      return errorResponse('Post ID is required')
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: user.id }
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    await prisma.post.delete({
      where: { id: postId }
    })

    return successResponse({ id: postId })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to delete post')
  }
}
