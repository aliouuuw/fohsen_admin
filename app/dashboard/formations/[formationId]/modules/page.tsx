import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ModulesList } from "@/components/modules/modules-list"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modules</h1>
        {/* Use Dialog to create a new module */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <ModulesList formationId={"1"} />
    </div>
  )
}