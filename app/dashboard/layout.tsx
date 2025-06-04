import { Sidebar } from "@/app/components/dashboard/sidebar";
import { Header } from "@/app/components/dashboard/header";
import { BreadcrumbProvider } from "@/app/components/dashboard/breadcrumb-provider";
import { getUserAction } from "@/lib/authism/server/actions/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserAction();
  // console.log(user)
  if (!user) {
    redirect("/");
  }
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />       
        <main className="flex-1 border-l p-6 overflow-y-scroll">
          <div className="mb-4">
            <BreadcrumbProvider />
          </div>
          {children}

          {/* <div className="flex-1 overflow-auto">
            <div className="h-[500vh] bg-blue-400">Content</div>
          </div> */}
        </main>
      </div>
    </div>
  );
}
