"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: {
    name: string
    href: string
  }[]
  homeHref?: string
  separator?: React.ReactNode
}

export function Breadcrumb({
  segments,
  homeHref = "/dashboard",
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span aria-hidden="true" className="flex items-center">
              {separator}
            </span>
            {index === segments.length - 1 ? (
              <span className="font-medium text-foreground">{segment.name}</span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground transition-colors"
              >
                {segment.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
