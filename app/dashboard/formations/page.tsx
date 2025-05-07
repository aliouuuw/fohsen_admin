import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { FormationsList } from "@/components/formations/formations-list"
import Link from "next/link"
import { getFormationsList } from "@/app/actions/formations/actions" // Import the server action

// Define the expected data structure based on the server action
interface FormationListItem {
  id: number; // Match schema ID type
  title: string;
  description: string | null;
  thumbnail: string | null;
  passingGrade: number;
  createdAt: string; // Use string for date display
  updatedAt: string; // Use string for date display
  _count: {
    modules: number; // From include _count
  };
  status: "PUBLISHED" | "DRAFT"; // Add status if needed
}

// This is a server component because we are fetching data directly
export default async function FormationsPage() {
  const { data: formations, error } = await getFormationsList(); // Fetch data using server action

  console.log(formations);

  if (error) {
    // Handle error, maybe display an error message
    console.error("Error fetching formations:", error);
    return <div>Error loading formations.</div>; // Simple error message
  }

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

      {/* Pass the fetched data to the list component */}
      <FormationsList formations={formations as FormationListItem[]} />
    </div>
  )
}