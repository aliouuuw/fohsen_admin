import { notFound } from 'next/navigation';
import { getCourseDetails } from "@/app/actions/courses/actions"; // Import the new action
import { Quiz, Resource } from '@prisma/client'; // Import types from Prisma client
import { JsonValue } from '@prisma/client/runtime/library';
import CourseForm from '@/app/components/courses/CourseForm';

interface EditCoursePageProps {
  params: Promise<{
    formationId: string;
    moduleId: string;
    courseId: string;
  }>;
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
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.courseId, 10);

  if (isNaN(courseId)) {
    notFound();
  }

  const course = await getCourseData(courseId);

  if (!course) {
    notFound();
  }

  let initialQuizDataForForm: Quiz | null = null;

  if (course.quiz) {
    let parsedOptions: JsonValue = course.quiz.options;
    if (typeof course.quiz.options === 'string') {
      try {
        parsedOptions = JSON.parse(course.quiz.options);
      } catch (err) {
        console.error("Failed to parse quiz options:", course.quiz.options, err);
        // Keep original or assign a default if parsing fails
      }
    }

    let parsedCorrectAnswers: JsonValue = course.quiz.correctAnswers;
    if (typeof course.quiz.correctAnswers === 'string') {
      try {
        parsedCorrectAnswers = JSON.parse(course.quiz.correctAnswers);
      } catch (err) {
        console.error("Failed to parse quiz correctAnswers:", course.quiz.correctAnswers, err);
        // Keep original or assign a default
      }
    }
    
    initialQuizDataForForm = {
      ...course.quiz, // Spread all original quiz properties
      options: parsedOptions, // Override with parsed options
      correctAnswers: parsedCorrectAnswers, // Override with parsed correctAnswers
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Course: {course.title}</h2>
      </div>
      <CourseForm
        courseId={course.id.toString()}
        initialData={{
          title: course.title,
          introduction: course.introduction || '',
          objective: course.objective || '',
          videoTitle: course.videoTitle || '',
          videoUrl: course.videoUrl || '',
          content: course.content,
          order: course.order,
          quiz: initialQuizDataForForm, // Use the correctly prepared quiz data
          resources: course.resources,
        }}
      />
    </div>
  );
}
