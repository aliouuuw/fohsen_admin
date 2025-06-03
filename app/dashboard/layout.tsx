import { Sidebar } from "@/app/components/dashboard/sidebar"
import { Header } from "@/app/components/dashboard/header"
import { BreadcrumbProvider } from "@/app/components/dashboard/breadcrumb-provider"
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
          <div className="mb-4">
            <BreadcrumbProvider />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}