"use client"

import { Button } from "@/app/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CoursesList } from "@/app/components/courses/courses-list"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ModuleCoursesPage() {
  const params = useParams()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cours</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les cours pour le module 1: Introduction aux soins de santé
          </p>
        </div>
        <Link 
          href={`/dashboard/formations/${params.formationId}/modules/${params.moduleId}/courses/new`}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau cours
          </Button>
        </Link>
      </div>

      <CoursesList 
        formationId={params.formationId as string}
        moduleId={params.moduleId as string}
      />
    </div>
  )
}