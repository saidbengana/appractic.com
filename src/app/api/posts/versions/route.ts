import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getUserFromSession } from '@/lib/api'
import { CreatePostVersionRequest } from '@/types/schema'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return errorResponse('Post ID is required')
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: user.id }
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    const versions = await prisma.postVersion.findMany({
      where: { postId },
      include: {
        socialAccount: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(versions)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch post versions')
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const data: CreatePostVersionRequest = await request.json()

    const post = await prisma.post.findFirst({
      where: { id: data.postId, userId: user.id }
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    if (data.accountId) {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: { id: data.accountId, userId: user.id }
      })

      if (!socialAccount) {
        return errorResponse('Social account not found', 404)
      }
    }

    const version = await prisma.postVersion.create({
      data: {
        postId: data.postId,
        accountId: data.accountId,
        content: data.content
      },
      include: {
        socialAccount: true
      }
    })

    return successResponse(version)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to create post version')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const versionId = searchParams.get('id')
    
    if (!versionId) {
      return errorResponse('Version ID is required')
    }

    const version = await prisma.postVersion.findFirst({
      where: {
        id: versionId,
        post: {
          userId: user.id
        }
      }
    })

    if (!version) {
      return errorResponse('Version not found', 404)
    }

    await prisma.postVersion.delete({
      where: { id: versionId }
    })

    return successResponse({ id: versionId })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to delete post version')
  }
}
