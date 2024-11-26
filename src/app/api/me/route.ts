import { NextRequest, NextResponse } from "next/server"
import { withApiAuth } from "@/middleware/api-auth"
import { supabase } from "@/lib/db"

export async function GET(req: NextRequest) {
  return withApiAuth(req, async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return new NextResponse("Internal Server Error", { status: 500 })
    }

    return NextResponse.json(data)
  })
}
