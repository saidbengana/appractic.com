import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Sidebar from '../../components/navigation/sidebar'
import TopNav from '../../components/navigation/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <TopNav />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
