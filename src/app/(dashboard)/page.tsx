import { DashboardStats } from '@/components/dashboard/stats'
import { RecentPosts } from '@/components/dashboard/recent-posts'
import { UpcomingPosts } from '@/components/dashboard/upcoming-posts'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentPosts />
        <UpcomingPosts />
      </div>
    </div>
  )
}
