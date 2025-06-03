"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb } from "@/app/components/ui/breadcrumb"
import { useMemo } from "react"

// Map route segments to display names
const segmentNames: Record<string, string> = {
  formations: "Formations",
  modules: "Modules",
  courses: "Cours",
  edit: "Édition",
  students: "Étudiants",
  analytics: "Analyses",
  forum: "Forum",
  resources: "Ressources",
  settings: "Paramètres"
}

export function BreadcrumbProvider() {
  const pathname = usePathname()
  
  const segments = useMemo(() => {
    if (!pathname || pathname === "/dashboard") return []
    
    const pathSegments = pathname
      .split("/")
      .filter(Boolean) // Remove empty strings
      .slice(1) // Remove the first segment which is 'dashboard'
    
    const breadcrumbSegments = []
    let currentPath = "/dashboard"
    
    // Process segments to remove IDs but maintain the logical path
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentPath += `/${segment}`
      
      // Check if this segment might be an ID (no display name mapping)
      const isId = !segmentNames[segment]
      
      // Skip ID segments in the breadcrumb display
      if (!isId) {
        breadcrumbSegments.push({
          name: segmentNames[segment] || segment,
          href: currentPath
        })
      }
    }
    
    return breadcrumbSegments
  }, [pathname])
  
  return <Breadcrumb segments={segments} />
}
