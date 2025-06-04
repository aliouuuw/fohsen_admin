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
    <div className="h-screen max-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="border-l flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-4">
                <BreadcrumbProvider />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}