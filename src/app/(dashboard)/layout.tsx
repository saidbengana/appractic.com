import Sidebar from '@/components/navigation/sidebar'
import TopNav from '@/components/navigation/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-100 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
