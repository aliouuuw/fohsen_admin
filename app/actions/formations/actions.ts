"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Action to fetch a list of formations
export async function getFormationsList() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: { title: 'asc' }, // Order formations alphabetically
      include: {
        _count: {
          select: { modules: true }, // Include count of modules
        },
      },
    });
    return { success: true, data: formations };
  } catch (error) {
    console.error("Get formations list error:", error);
    return { success: false, error: "Failed to fetch formations", data: [] };
  }
}

// Create a new formation
export async function createFormation(data: {
  title: string;
  description?: string;
  thumbnail?: string;
  passingGrade?: number;
  status?: "DRAFT" | "PUBLISHED";
}) {
  try {
    const newFormation = await prisma.formation.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        passingGrade: data.passingGrade || 70.0,
        status: data.status || "DRAFT",
      },
    });
    
    revalidatePath('/dashboard/formations', 'page'); // Revalidate the list page
    return { success: true, data: newFormation };
  } catch (error) {
    console.error("Create formation error:", error);
    return { success: false, error: "Failed to create formation" };
  }
}

// Update an existing formation
export async function updateFormation(formationId: number, data: {
  title?: string;
  description?: string;
  thumbnail?: string;
  passingGrade?: number;
  status?: "DRAFT" | "PUBLISHED";
}) {
  try {
    const updatedFormation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        passingGrade: data.passingGrade,
        status: data.status,
      },
    });
    
    revalidatePath('/dashboard/formations', 'page');
    revalidatePath(`/dashboard/formations/${formationId}`, 'page');
    return { success: true, data: updatedFormation };
  } catch (error) {
    console.error("Update formation error:", error);
    return { success: false, error: "Failed to update formation" };
  }
}

// Delete a formation
export async function deleteFormation(formationId: number) {
  try {
    // Check if formation has modules/courses before deleting
    const formationWithModules = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        modules: {
          include: {
            courses: true,
          },
        },
      },
    });

    if (!formationWithModules) {
      return { success: false, error: "Formation not found" };
    }

    const hasContent = formationWithModules.modules.some(module => module.courses.length > 0);
    if (hasContent) {
      return { success: false, error: "Cannot delete formation with existing courses. Please delete all courses first." };
    }

    await prisma.formation.delete({
      where: { id: formationId },
    });
    
    revalidatePath('/dashboard/formations', 'page');
    return { success: true, data: null };
  } catch (error) {
    console.error("Delete formation error:", error);
    return { success: false, error: "Failed to delete formation" };
  }
}

// Publish/unpublish a formation
export async function publishFormation(formationId: number, publish: boolean) {
  try {
    const updatedFormation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        status: publish ? "PUBLISHED" : "DRAFT",
      },
    });
    
    revalidatePath('/dashboard/formations', 'page');
    revalidatePath(`/dashboard/formations/${formationId}`, 'page');
    return { success: true, data: updatedFormation };
  } catch (error) {
    console.error("Publish formation error:", error);
    return { success: false, error: "Failed to update formation status" };
  }
}

// Get a single formation
export async function getFormation(formationId: number) {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { courses: true },
            },
          },
        },
        _count: {
          select: { 
            modules: true,
            enrollments: true,
            certificates: true,
          },
        },
      },
    });

    return { success: true, data: formation };
  } catch (error) {
    console.error("Get formation error:", error);
    return { success: false, error: "Failed to fetch formation" };
  }
}
