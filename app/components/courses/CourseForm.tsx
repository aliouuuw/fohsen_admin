"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import TiptapEditor from './tiptap-editor';
import ResourceManager from '@/app/components/courses/ResourceManager';
import QuizEditor from '@/app/components/courses/QuizEditor';
import { UploadButton } from "@/utils/uploadthing";
import { updateCourse, upsertQuiz, syncResources } from '@/app/actions/courses/actions';
import { ResourceType, Quiz as PrismaQuiz, Resource as PrismaResource } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

// Form validation schema
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  introduction: z.string().optional(),
  objective: z.string().optional(),
  videoTitle: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  content: z.any(), // TipTap content
  order: z.number(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface ResourceFormData {
  title: string;
  type: ResourceType;
  url: string;
  description?: string;
}

interface QuizFormData {
  question: string;
  options: string[];
  correctAnswers: number[];
}

interface CourseFormProps {
  initialData?: CourseFormData & {
    quiz?: PrismaQuiz | null;
    resources?: PrismaResource[];
  };
  courseId: string; // Made courseId mandatory as we're editing existing
  // onSave: (data: CourseFormData) => Promise<void>; // We'll handle save internally
}

export default function CourseForm({ initialData, courseId }: CourseFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [currentResources, setCurrentResources] = useState<ResourceFormData[]>(
    initialData?.resources?.map(r => ({
      title: r.title,
      type: r.type,
      url: r.url,
      description: r.description || undefined,
    })) || []
  );
  const [currentQuiz, setCurrentQuiz] = useState<QuizFormData | undefined>(
    initialData?.quiz
      ? {
          question: initialData.quiz.question,
          options: initialData.quiz.options as string[], // Assuming options are stored as string[]
          correctAnswers: initialData.quiz.correctAnswers as number[], // Assuming correctAnswers are stored as number[]
        }
      : undefined
  );

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      introduction: initialData?.introduction || "",
      objective: initialData?.objective || "",
      videoTitle: initialData?.videoTitle || "",
      videoUrl: initialData?.videoUrl || "",
      content: initialData?.content || null,
      order: initialData?.order || 0,
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    setIsSaving(true);
    try {
      const numericCourseId = parseInt(courseId, 10);

      // 1. Update basic course details
      const courseUpdateResult = await updateCourse(numericCourseId, {
        title: data.title,
        introduction: data.introduction,
        objective: data.objective,
        videoTitle: data.videoTitle,
        videoUrl: data.videoUrl,
        content: data.content, // This comes from TipTap editor via form.setValue
        order: data.order,
      });

      if (!courseUpdateResult.success) {
        throw new Error(courseUpdateResult.error || "Failed to update course details");
      }

      // 2. Upsert Quiz
      if (currentQuiz && currentQuiz.question) { // Only save if there's a question
        const quizResult = await upsertQuiz(numericCourseId, {
          question: currentQuiz.question,
          options: currentQuiz.options as JsonValue, // Cast to JsonValue
          correctAnswers: currentQuiz.correctAnswers as JsonValue, // Cast to JsonValue
        });
        if (!quizResult.success) {
          throw new Error(quizResult.error || "Failed to save quiz");
        }
      }

      // 3. Sync Resources
      const resourcesResult = await syncResources(numericCourseId, currentResources);
      if (!resourcesResult.success) {
        throw new Error(resourcesResult.error || "Failed to save resources");
      }

      alert("Course saved successfully!"); // Replace with a proper notification

    } catch (error) {
      console.error('Error saving course:', error);
      alert(`Error: ${(error as Error).message}`); // Replace with a proper error display
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  // error={form.formState.errors.title?.message}
                />
              </div>
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  {...form.register("introduction")}
                />
              </div>
              <div>
                <Label htmlFor="objective">Learning Objective</Label>
                <Textarea
                  id="objective"
                  {...form.register("objective")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                courseId={courseId} // Pass courseId as string
                initialContent={JSON.stringify(form.getValues("content") || "")} // Ensure stringified JSON for TipTap
                onChange={(newContent: string) => {
                    try {
                        form.setValue("content", JSON.parse(newContent));
                    } catch (e) {
                        console.log(e);
                        console.warn("Content from TipTap is not valid JSON, storing as string or check TipTap config", newContent);
                        form.setValue("content", newContent);
                    }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoTitle">Video Title</Label>
                <Input
                  id="videoTitle"
                  {...form.register("videoTitle")}
                />
              </div>
              <div>
                <Label>Video Upload</Label>
                <UploadButton
                  endpoint="courseVideo"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      form.setValue("videoUrl", res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error('Upload Error:', error);
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return "Choisir une vidéo";
                      return "Préparation...";
                    },
                    allowedContent({ ready, fileTypes, isUploading }) {
                      if (!ready) return "Vérification des types de fichiers...";
                      if (isUploading) return "Téléchargement en cours...";
                      return `Formats acceptés: ${fileTypes.join(", ")}`;
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager
            courseId={courseId}
            initialResources={currentResources}
            onResourcesChange={(updatedResources) => {
              setCurrentResources(updatedResources);
            }}
          />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizEditor
            // courseId is optional in QuizEditor now, we pass it if needed for direct API calls from there
            initialQuiz={currentQuiz}
            onQuizChange={(updatedQuiz) => {
              setCurrentQuiz(updatedQuiz);
            }}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => { /* Handle cancel, maybe router.back() */ }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || !form.formState.isDirty && currentResources === initialData?.resources && currentQuiz === initialData?.quiz} // Basic dirty check
        >
          {isSaving ? "Saving..." : "Save Course"}
        </Button>
      </div>
    </form>
  );
} 