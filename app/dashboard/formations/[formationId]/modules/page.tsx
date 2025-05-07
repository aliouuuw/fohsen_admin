import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ModulesList } from "@/components/modules/modules-list"
import Link from "next/link"
import { getModulesList } from "@/app/actions/courses/actions" // Import the action
import { getFormation } from "@/app/actions/formations/actions"

interface ModuleListItem {
  id: number;
  title: string;
  description: string | null;
  order: number;
  level: string;
  status: string;
  formationId: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    courses: number;
  };
}


// This is a server component
export default async function FormationModulesPage({ params }: { params: { formationId: string } }) {
  const formationId = parseInt(params.formationId, 10); // Parse formationId to number

   if (isNaN(formationId)) {
       // Handle invalid ID, maybe redirect or show error
        console.error("Invalid formationId:", params.formationId);
       // You might want to redirect to formations list or show a notFound page
   }


  const { data: modules, error } = await getModulesList(formationId); // Fetch modules

  const { data: formation } = await getFormation(formationId);


   if (error) {
      console.error("Error fetching modules:", error);
      return <div>Error loading modules.</div>;
   }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modules</h1>
          {/* You might want to fetch formation title here if needed */}
          <p className="text-muted-foreground mt-2">
            Gérer les modules pour la formation {formation?.title}
          </p>
        </div>
        {/* Use formationId in the link for creating new module */}
        <Link href={`/dashboard/formations/${params.formationId}/modules/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Module
          </Button>
        </Link>
      </div>

      {/* Pass the fetched modules and formationId to ModulesList */}
      <ModulesList formationId={params.formationId} modules={modules as ModuleListItem[]} />
    </div>
  )
}