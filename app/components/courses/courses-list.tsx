"use client";

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
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash,
  Video,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { useEffect, useState } from "react";
import { getCoursesList } from "@/app/actions/courses/actions";

interface CourseListItem {
  id: number;
  title: string;
  introduction: string;
  status: string;
  updatedAt: string;
}
interface CoursesListProps {
  formationId: string;
  moduleId: string;
}

export function CoursesList({ formationId, moduleId }: CoursesListProps) {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getCoursesList(parseInt(moduleId));
        
        if (response.success) {
          setCourses(response.data as CourseListItem[]);
        } else {
          setError(response.error || "Failed to load courses");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [moduleId]);

  if (loading) {
    return <div className="flex justify-center py-10">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 bg-slate-200">
              {/* Placeholder for course thumbnail */}
              <Link
                href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-10 w-10 text-slate-400" />
                </div>
              </Link>
              <div className="absolute top-2 right-2">
                <Badge
                  variant={course.status === "published" ? "default" : "secondary"}
                >
                  {course.status}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Link
                  className="hover:underline"
                  href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}
                >
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mt-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link
                      href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}
                    >
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier le contenu
                      </DropdownMenuItem>
                    </Link>
                    <Link
                      href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit?preview=true`}
                    >
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Aperçu
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pb-2 flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                {course.introduction || "Aucune description disponible"}
              </p>
            </CardContent>

            <CardFooter className="pt-2">
              <div className="flex justify-between items-center w-full">
                <span className="text-xs text-muted-foreground">
                  {course.updatedAt ? `Dernière mise à jour: ${new Date(course.updatedAt).toLocaleDateString()}` : ""}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}

        {/* Add New Course Card */}
        <Link
          href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/new`}
          className="block"
        >
          <Card className="h-full flex flex-col items-center justify-center p-6 border-dashed">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <PlusCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-center">
              Ajouter un nouveau cours
            </h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Créer un nouveau cours avec vidéo, texte, quiz et forums
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
