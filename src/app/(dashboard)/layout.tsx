import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Schedule", href: "/schedule" },
    { name: "Analytics", href: "/analytics" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Appractic
          </Link>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <div className="ml-64">
        {/* Top header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-end px-8 border-b">
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
