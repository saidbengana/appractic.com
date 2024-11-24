import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getUserFromSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data })
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error }, { status })
}
