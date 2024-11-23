import Stats from '@/components/dashboard/stats'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <Stats />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
          <p className="text-gray-500">No recent posts</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
          <p className="text-gray-500">No upcoming posts scheduled</p>
        </div>
      </div>
    </div>
  )
}
