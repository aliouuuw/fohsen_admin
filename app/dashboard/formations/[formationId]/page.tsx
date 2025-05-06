"use client"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ModulesList } from "@/components/modules/modules-list"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function FormationModulesPage() {
  const params = useParams()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modules</h1>
          <p className="text-muted-foreground mt-2">
            Manage modules for this formation
          </p>
        </div>
        <Link href={`/dashboard/formations/${params.formationId}/modules/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Module
          </Button>
        </Link>
      </div>

      <ModulesList formationId={params.formationId as string} />
    </div>
  )
}