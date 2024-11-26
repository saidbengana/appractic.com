import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function withApiAuth(
  req: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    return await handler(userId)
  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
