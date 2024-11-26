import { useQuery } from "@tanstack/react-query";

interface Analytics {
  totalPosts: number;
  engagementRate: number;
  totalFollowers: number;
  postPerformance: Array<{
    date: string;
    impressions: number;
    reach: number;
    engagement: number;
  }>;
  engagementOverTime: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  recentActivity: Array<{
    userImage: string;
    userName: string;
    action: string;
    metric: string;
  }>;
}

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });
}
