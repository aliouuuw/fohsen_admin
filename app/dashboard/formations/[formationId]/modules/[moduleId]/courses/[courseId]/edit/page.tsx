import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourseDetails } from "@/app/actions/courses/actions"; // Import the new action
import { Quiz, Resource } from '@prisma/client'; // Import types from Prisma client
import { JsonValue } from '@prisma/client/runtime/library';
import TiptapEditor from '@/components/courses/tiptap-editor';

interface EditCoursePageProps {
  params: {
    formationId: string;
    moduleId: string;
    courseId: string;
  };
}

// Update the interface to match the data returned by getCourseDetails
interface CourseWithDetails {
  id: number;
  title: string;
  introduction: string | null; // Add other fields as needed
  objective: string | null;
  videoTitle: string | null;
  videoUrl: string | null;
  content: JsonValue; // Json type becomes 'any' or a more specific structure if you define it
  order: number;
  moduleId: number;
  quiz: Quiz | null; // Include Quiz relation
  resources: Resource[]; // Include Resource relation
  createdAt: Date;
  updatedAt: Date;
}

// Fetch initial course data including content
async function getCourseData(courseId: number): Promise<CourseWithDetails | null> {
   try {
     // Call the new action to get full details
     const result = await getCourseDetails(courseId);

     if (!result.success || !result.data) {
         return null; // Return null if fetch failed or course not found
     }

     return result.data as CourseWithDetails; // Cast the data to the interface type
   } catch (error) {
     console.error("Error fetching course data:", error);
     return null;
   }
}


export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const courseId = parseInt(params.courseId, 10); // Parse courseId to a number

  if (isNaN(courseId)) {
      notFound(); // Handle invalid course ID
  }

  // Fetch the course data including content
  const course = await getCourseData(courseId);

  if (!course) {
    notFound(); // Show 404 if course not found
  }

  // Extract initial content (it can be null) and stringify for the editor
  const initialContent = course.content ? JSON.stringify(course.content) : "";


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Course: {course.title}</h2>
        {/* Add breadcrumbs or back links here */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>Edit the rich content for this course.</CardDescription>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            courseId={course.id.toString()} // Pass courseId as string to the component (component expects string)
            initialContent={initialContent}
            // The onSave logic is now handled internally by the CourseEditor
            // which calls the saveCourseContent server action
          />
        </CardContent>
      </Card>

      {/* You can now use course.quiz and course.resources here to pass to other components */}
      {/* For example: */}
      {/* <QuizEditor courseId={course.id} initialQuiz={course.quiz} /> */}
      {/* <ResourcesManager courseId={course.id} initialResources={course.resources} /> */}
    </div>
  );
}
