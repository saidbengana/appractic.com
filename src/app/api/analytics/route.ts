import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total posts count
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId);

    if (postsError) throw postsError;
    const totalPosts = posts?.length || 0;

    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (analyticsError) throw analyticsError;

    // Transform analytics data
    const engagementRate = analytics?.reduce((acc, curr) => acc + (curr.engagement_rate || 0), 0) / (analytics?.length || 1);
    const reachGrowth = analytics?.reduce((acc, curr) => acc + (curr.reach_growth || 0), 0) / (analytics?.length || 1);
    
    return NextResponse.json({
      totalPosts,
      analytics: {
        engagementRate: engagementRate || 0,
        reachGrowth: reachGrowth || 0,
        history: analytics || []
      }
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
