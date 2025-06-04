"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma, ResourceType } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { getFirstYouTubeThumbnail } from "@/lib/youtube-utils";

export async function saveCourseContent(courseId: number, content: string) {
  try {
    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        content: content,
      },
    });

    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses/${courseId}`, 'page');
    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses`, 'page');

    return {
      success: true,
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Save course content error:", error);
    return {
      success: false,
      error: "Failed to save course content",
    };
  }
}

export async function getCourseContent(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        content: true,
      },
    });

    return {
      success: true,
      data: course?.content,
    };
  } catch (error) {
    console.error("Get course content error:", error);
    return {
      success: false,
      error: "Failed to fetch course content",
    };
  }
}

export async function createCourse(data: {
  title: string;
  introduction?: string;
  objective?: string;
  videoTitle?: string;
  videoUrl?: string;
  moduleId: string;
}) {
  try {
    const highestOrder = await prisma.course.findFirst({
      where: { moduleId: parseInt(data.moduleId) },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    const order = highestOrder ? highestOrder.order + 1 : 1;

    const newCourse = await prisma.course.create({
      data: {
        title: data.title,
        introduction: data.introduction,
        objective: data.objective,
        videoTitle: data.videoTitle,
        videoUrl: data.videoUrl,
        moduleId: parseInt(data.moduleId),
        order: order,
      },
      select: {
        id: true,
        moduleId: true
      }
    });

    revalidatePath(`/dashboard/formations/[formationId]/modules/${data.moduleId}/courses`, 'page');

    return {
      success: true,
      data: newCourse,
    };
  } catch (error) {
    console.error("Create course error:", error);
    return {
      success: false,
      error: "Failed to create course",
    };
  }
}

// Action to fetch full course details for editing/display
export async function getCourseDetails(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        quiz: true, // Include related Quiz data
        resources: true, // Include related Resource data
      },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found",
        data: null, // Explicitly return null for data on error/not found
      };
    }

    return {
      success: true,
      data: course,
    };
  } catch (error) {
    console.error("Get course details error:", error);
    return {
      success: false,
      error: "Failed to fetch course details",
      data: null, // Explicitly return null for data on error
    };
  }
}

// Action to fetch a list of modules for a specific formation
export async function getModulesList(formationId: number) {
  try {
    const modules = await prisma.module.findMany({
      where: { formationId: formationId },
      orderBy: { order: 'asc' }, // Order modules by their defined order
      include: {
         _count: {
          select: { courses: true }, // Include count of courses
        },
        // You might include average progress here later
      },
    });
    return { success: true, data: modules };
  } catch (error) {
    console.error("Get modules list error:", error);
    return { success: false, error: "Failed to fetch modules", data: [] };
  }
}

// Action to fetch a list of courses for a specific module
export async function getCoursesList(moduleId: number) {
  try {
    const courses = await prisma.course.findMany({
      where: { moduleId: moduleId },
      orderBy: { order: 'asc' }, // Order courses by their defined order
      select: {
        id: true,
        title: true,
        introduction: true,
        updatedAt: true,
        content: true, // Include content to extract YouTube thumbnails
        quiz: { // Include quiz data to check if it exists
          select: { id: true }
        },
        resources: { // Include resources data to check if they exist
          select: { id: true }
        }
      },
    });
    
    // Map to include hasQuiz/hasResources flags and YouTube thumbnail
    const coursesWithFlags = courses.map(course => ({
        id: course.id,
        title: course.title,
        introduction: course.introduction,
        updatedAt: course.updatedAt,
        hasQuiz: !!course.quiz,
        hasResources: course.resources.length > 0,
        thumbnail: getFirstYouTubeThumbnail(course.content), // Extract YouTube thumbnail
        // Add status 'published'/'draft' if you add a status field to Course model
        status: 'published', // Placeholder, update schema and logic if needed
    }));

    return { success: true, data: coursesWithFlags };
  } catch (error) {
    console.error("Get courses list error:", error);
    return { success: false, error: "Failed to fetch courses", data: [] };
  }
}

interface CourseUpdateData {
  title: string;
  introduction?: string | null;
  objective?: string | null;
  videoTitle?: string | null;
  videoUrl?: string | null;
  content?: JsonValue | null;
  order?: number;
  // We'll handle quiz and resources separately for now to keep it modular
  // but you could include them here if you prefer a single transaction
}

export async function updateCourse(courseId: number, data: CourseUpdateData) {
  try {
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        introduction: data.introduction,
        objective: data.objective,
        videoTitle: data.videoTitle,
        videoUrl: data.videoUrl,
        content: data.content === null ? Prisma.JsonNull : data.content,
        order: data.order,
        // Add other fields as necessary
      },
    });

    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses/${courseId}/edit`, 'page');
    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses/${courseId}`, 'page');
    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses`, 'page');

    return {
      success: true,
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Update course error:", error);
    return {
      success: false,
      error: "Failed to update course",
    };
  }
}

interface QuizData {
  question: string;
  options: JsonValue; // Prisma expects JsonValue for Json fields
  correctAnswers: JsonValue; // Prisma expects JsonValue for Json fields
}

export async function upsertQuiz(courseId: number, quizData: QuizData) {
  try {
    const quiz = await prisma.quiz.upsert({
      where: { courseId: courseId },
      update: {
        question: quizData.question,
        options: quizData.options as Prisma.InputJsonValue,
        correctAnswers: quizData.correctAnswers as Prisma.InputJsonValue,
      },
      create: {
        courseId: courseId,
        question: quizData.question,
        options: quizData.options as Prisma.InputJsonValue,
        correctAnswers: quizData.correctAnswers as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses/${courseId}/edit`, 'page');

    return {
      success: true,
      data: quiz,
    };
  } catch (error) {
    console.error("Upsert quiz error:", error);
    return {
      success: false,
      error: "Failed to save quiz",
    };
  }
}

interface ResourceData {
  title: string;
  type: ResourceType;
  url: string;
  description?: string | null;
}

export async function syncResources(courseId: number, resources: ResourceData[]) {
  try {
    // For simplicity, we'll delete existing resources and recreate them.
    // For a more robust solution, you might want to compare and update/create/delete individually.
    await prisma.resource.deleteMany({
      where: { courseId: courseId },
    });

    if (resources.length > 0) {
      await prisma.resource.createMany({
        data: resources.map(res => ({ ...res, courseId })),
      });
    }

    revalidatePath(`/dashboard/formations/[formationId]/modules/[moduleId]/courses/${courseId}/edit`, 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error("Sync resources error:", error);
    return {
      success: false,
      error: "Failed to sync resources",
    };
  }
}
