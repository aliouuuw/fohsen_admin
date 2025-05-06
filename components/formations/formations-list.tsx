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
  import { MoreHorizontal, Pencil, Eye, Trash, Book } from "lucide-react"
  import Link from "next/link"
  
  // Temporary mock data
  const formations = [
    {
      id: "1",
      title: "Formation en Santé Communautaire",
      totalModules: 5,
      totalStudents: 120,
      status: "active",
      lastUpdated: "2024-03-15",
    },
    {
      id: "2",
      title: "Formation en Soins de Santé Primaires",
      totalModules: 3,
      totalStudents: 75,
      status: "draft",
      lastUpdated: "2024-03-14",
    },
  ]
  
  export function FormationsList() {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Total Modules</TableHead>
              <TableHead>Total Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formations.map((formation) => (
              <TableRow key={formation.id}>
                <TableCell className="font-medium"><Link className="hover:underline" href={`/dashboard/formations/${formation.id}`}>{formation.title}</Link></TableCell>
                <TableCell>{formation.totalModules}</TableCell>
                <TableCell>{formation.totalStudents}</TableCell>
                <TableCell>
                  <Badge variant={formation.status === "active" ? "default" : "secondary"}>
                    {formation.status}
                  </Badge>
                </TableCell>
                <TableCell>{formation.lastUpdated}</TableCell>
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
                      <Link href={`/dashboard/formations/${formation.id}/modules`}>
                        <DropdownMenuItem>
                          <Book className="mr-2 h-4 w-4" />
                          Manage Modules
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
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