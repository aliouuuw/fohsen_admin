
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
  import { 
    MoreHorizontal, 
    Pencil, 
    Eye, 
    Trash, 
    FileText,
    Video,
    Activity,
    MessageSquare,
    PlusCircle,
    Settings
  } from "lucide-react"
  import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card"
  
  // Mock data based on your mobile app structure
  const courses = [
    {
      id: "1",
      title: "Prise en charge intégrée des maladies de l'enfant",
      description: "Ce cours couvre les principes de la PCIME pour améliorer la santé des enfants de moins de 5 ans.",
      type: "video",
      thumbnail: "/images/course-1.jpg",
      status: "published",
      lastUpdated: "2024-03-15",
    },
    {
      id: "2",
      title: "Les signes de danger chez l'enfant",
      description: "Apprenez à identifier les signes de danger chez l'enfant qui nécessitent une attention médicale immédiate.",
      thumbnail: "/images/course-2.jpg",
      status: "draft",
      lastUpdated: "2024-03-14",
    },
    {
      id: "3",
      title: "La nutrition infantile",
      description: "Principes fondamentaux de la nutrition infantile et prévention de la malnutrition.",
      thumbnail: "/images/course-3.jpg",
      status: "published",
      lastUpdated: "2024-02-28",
    },
    {
      id: "4",
      title: "Vaccination et immunité collective",
      description: "L'importance des vaccinations infantiles et leur impact sur la santé communautaire.",
      thumbnail: "/images/course-4.jpg",
      hasQuiz: false,
      status: "draft",
      lastUpdated: "2024-02-25",
    }
  ]
  
  interface CoursesListProps {
    formationId: string
    moduleId: string
  }
  
  export function CoursesList({ formationId, moduleId }: CoursesListProps) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-slate-200">
                {/* Placeholder for course thumbnail */}
                  <Link href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-10 w-10 text-slate-400" /> 
                    </div>
                  </Link>
                <div className="absolute top-2 right-2">
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Link className="hover:underline" href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}>
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
                          Edit Content
                        </DropdownMenuItem>
                      </Link>
                      <Link 
                        href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}`}
                      >
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                 {course.description}
                </p>
              </CardContent>
              
              <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-muted-foreground">
                    Updated: {course.lastUpdated}
                  </span>
                  <Link 
                    href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${course.id}/edit`}
                  >
                    <Button size="sm">
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
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
              <h3 className="text-lg font-semibold text-center">Add New Course</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Create a new course with video, text, quizzes and forums
              </p>
            </Card>
          </Link>
        </div>

        {/* Quick Actions Section - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileText className="h-5 w-5" />
            <span>Manage Materials</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Activity className="h-5 w-5" />
            <span>Manage Quizzes</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Manage Forums</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Settings className="h-5 w-5" />
            <span>Module Settings</span>
          </Button>
        </div>
      </div>
    )
  }