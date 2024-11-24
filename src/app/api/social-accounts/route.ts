import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getUserFromSession } from '@/lib/api'
import { CreateSocialAccountRequest } from '@/types/schema'

export async function GET() {
  try {
    const user = await getUserFromSession()
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse(accounts)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch social accounts')
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const data: CreateSocialAccountRequest = await request.json()

    // Check if account already exists
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: data.platform,
        platformUserId: data.platformUserId
      }
    })

    if (existingAccount) {
      // Update existing account
      const updatedAccount = await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          platformUsername: data.platformUsername,
          avatar: data.avatar,
          isConnected: true
        }
      })
      return successResponse(updatedAccount)
    }

    // Create new account
    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platform: data.platform,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        platformUsername: data.platformUsername,
        platformUserId: data.platformUserId,
        avatar: data.avatar,
        isConnected: true
      }
    })

    return successResponse(account)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to create social account')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return errorResponse('Account ID is required')
    }

    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId: user.id }
    })

    if (!account) {
      return errorResponse('Social account not found', 404)
    }

    // Instead of deleting, mark as disconnected
    const updatedAccount = await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        isConnected: false,
        accessToken: '', // Clear sensitive data
        refreshToken: null
      }
    })

    return successResponse(updatedAccount)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to disconnect social account')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return errorResponse('Account ID is required')
    }

    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId: user.id }
    })

    if (!account) {
      return errorResponse('Social account not found', 404)
    }

    const data = await request.json()
    const updatedAccount = await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        platformUsername: data.platformUsername,
        avatar: data.avatar,
        isConnected: true
      }
    })

    return successResponse(updatedAccount)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to update social account')
  }
}
