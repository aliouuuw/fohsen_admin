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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Layout,
  },
  {
    title: "Formations",
    href: "/dashboard/formations",
    icon: BookOpen,
  },
  {
    title: "Étudiants",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Statistiques",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Forum",
    href: "/dashboard/forum",
    icon: MessageSquare,
  },
  {
    title: "Ressources",
    href: "/dashboard/resources",
    icon: FileText,
  },
  {
    title: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "h-full flex flex-col bg-sidebar text-foreground transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
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
                "w-full gap-2 mb-1 transition-all duration-300",
                isCollapsed ? "justify-center px-2" : "justify-start",
                pathname === item.href && "bg-secondary"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Button>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-start gap-2"
          )}
          title={isCollapsed ? (isCollapsed ? "Expand sidebar" : "Collapse sidebar") : undefined}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}