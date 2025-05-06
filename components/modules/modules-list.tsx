import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, BookOpen } from "lucide-react"
import Link from "next/link"

// Mock data - will be replaced with real data
const modules = [
  {
    id: "1",
    title: "Introduction aux soins de santé",
    totalCourses: 3,
    accomplished: 2,
    registered: 10,
    level: "débutant",
    status: "publié",
    lastUpdated: "2024-03-15",
  },
  {
    id: "2",
    title: "Prise en charge des maladies courantes",
    totalCourses: 4,
    accomplished: 0,
    registered: 10,
    level: "intermédiaire",
    status: "brouillon",
    lastUpdated: "2024-03-14",
  },
]

interface ModulesListProps {
  formationId: string
}

export function ModulesList({ formationId }: ModulesListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Cours</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Accomplis</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de mise à jour</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>{module.id}</TableCell>
              <TableCell className="font-medium"><Link className="hover:underline" href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`}>{module.title}</Link></TableCell>
              <TableCell>{module.totalCourses}</TableCell>
              <TableCell><Badge variant={module.level === "débutant" ? "beginner" : module.level === "intermédiaire" ? "intermediate" : "advanced"}>{module.level}</Badge></TableCell>
              <TableCell>{module.accomplished}/{module.registered}</TableCell>
              <TableCell>
                <Badge variant={module.status === "publié" ? "default" : "secondary"}>
                  {module.status}
                </Badge>
              </TableCell>
              <TableCell>{module.lastUpdated}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`}>
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Gérer les cours
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}