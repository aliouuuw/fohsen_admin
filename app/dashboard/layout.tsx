import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { getUserAction } from "@/lib/authism/server/actions/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserAction()
  // console.log(user)
  if (!user) {
    redirect("/")
  }
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="border-l p-6">
          {children}
        </main>
      </div>
    </div>
  )
}