"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import {
  BookOpen,
  Users,
  BarChart,
  Settings,
  MessageSquare,
  FileText,
  Layout,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Layout,
  },
  {
    title: "Formations",
    href: "/dashboard/formations",
    icon: BookOpen,
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
  },
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-sidebar text-foreground">
      <div className="px-6 py-[18px] bg-sidebar-primary">
        <h1 className="text-xl font-bold text-sidebar-primary-foreground">Fohsen Admin</h1>
      </div>
      <nav className="flex-1 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block"
          >
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 mb-1",
                pathname === item.href && "bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  )
}