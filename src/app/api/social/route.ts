import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Platform } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.socialAccount.findMany({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { platform, accountId, accessToken, refreshToken, expiresAt, profileData } = data

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const account = await prisma.socialAccount.upsert({
      where: {
        platform_accountId: {
          platform: platform as Platform,
          accountId
        }
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        profileData,
        updatedAt: new Date()
      },
      create: {
        platform: platform as Platform,
        accountId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        profileData,
        userId: user.id
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error creating/updating social account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const accountId = searchParams.get('accountId')

    if (!platform || !accountId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    await prisma.socialAccount.delete({
      where: {
        platform_accountId: {
          platform: platform as Platform,
          accountId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
