import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { MoreHorizontal, Pencil, Trash, BookOpen, Eye } from "lucide-react";
import Link from "next/link";

// Mock data - REMOVE THIS SECTION
// const modules = [...]

// Define expected data structure based on server action
interface ModuleListItem {
  id: number; // Match schema ID type
  title: string;
  description: string | null;
  order: number;
  level: string; // Use string for enum display
  status: string; // Use string for enum display
  formationId: number; // Match schema ID type
  createdAt: string;
  updatedAt: string;
  _count: {
    courses: number; // From include _count
  };
}

interface ModulesListProps {
  formationId: string; // Keep as string for URL params
  modules: ModuleListItem[]; // Accept fetched data
}

// Update component signature
export function ModulesList({ formationId, modules }: ModulesListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Map over fetched modules */}
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>{module.order}</TableCell>
              <TableCell className="font-medium">{module.title}</TableCell>
              <TableCell>{module._count.courses}</TableCell>
              <TableCell>{module.level}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    module.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {module.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(module.updatedAt).toLocaleDateString()}
              </TableCell>
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
                    <Link
                      href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`}
                    >
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Courses
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Edit{" "}
                      {/* Link to /dashboard/formations/${formationId}/modules/${module.id}/edit */}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
