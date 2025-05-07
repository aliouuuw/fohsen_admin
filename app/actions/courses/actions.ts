"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      include: {
         quiz: { // Include quiz data to check if it exists
           select: { id: true }
         },
         resources: { // Include resources data to check if they exist
           select: { id: true }
         }
      },
    });
    // Map to include hasQuiz/hasResources flags
    const coursesWithFlags = courses.map(course => ({
        ...course,
        hasQuiz: !!course.quiz,
        hasResources: course.resources.length > 0,
        // Add status 'published'/'draft' if you add a status field to Course model
        status: 'published', // Placeholder, update schema and logic if needed
    }));

    return { success: true, data: coursesWithFlags };
  } catch (error) {
    console.error("Get courses list error:", error);
    return { success: false, error: "Failed to fetch courses", data: [] };
  }
}
