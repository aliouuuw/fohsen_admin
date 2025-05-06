import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { FormationsList } from "@/components/formations/formations-list"
import Link from "next/link"

export default function FormationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Formations</h1>
        <Link href="/dashboard/formations/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Formation
          </Button>
        </Link>
      </div>

      <FormationsList />
    </div>
  )
}