"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Level, Status } from "@prisma/client";

// Interface for module creation
interface CreateModuleData {
  title: string;
  description?: string;
  level: Level;
  formationId: number;
}

// Interface for module update
interface UpdateModuleData {
  title?: string;
  description?: string;
  level?: Level;
  status?: Status;
  order?: number;
}

// Create a new module
export async function createModule(data: CreateModuleData) {
  try {
    // Get the highest order number for this formation
    const highestOrder = await prisma.module.findFirst({
      where: { formationId: data.formationId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    const order = highestOrder ? highestOrder.order + 1 : 1;

    const newModule = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        formationId: data.formationId,
        order: order,
        status: Status.DRAFT, // Default to draft
      },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    // Revalidate paths
    revalidatePath(`/dashboard/formations/${data.formationId}/modules`);
    revalidatePath(`/dashboard/formations/${data.formationId}`);

    return {
      success: true,
      data: newModule,
    };
  } catch (error) {
    console.error("Create module error:", error);
    return {
      success: false,
      error: "Impossible de créer le module",
    };
  }
}

// Get a single module with details
export async function getModule(moduleId: number) {
  try {
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
          }
        },
        courses: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            introduction: true,
            objective: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!moduleData) {
      return {
        success: false,
        error: "Module non trouvé",
        data: null,
      };
    }

    return {
      success: true,
      data: moduleData,
    };
  } catch (error) {
    console.error("Get module error:", error);
    return {
      success: false,
      error: "Impossible de récupérer le module",
      data: null,
    };
  }
}

// Update a module
export async function updateModule(moduleId: number, data: UpdateModuleData) {
  try {
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: data,
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    // Revalidate paths
    revalidatePath(`/dashboard/formations/${updatedModule.formationId}/modules`);
    revalidatePath(`/dashboard/formations/${updatedModule.formationId}/modules/${moduleId}`);
    revalidatePath(`/dashboard/formations/${updatedModule.formationId}`);

    return {
      success: true,
      data: updatedModule,
    };
  } catch (error) {
    console.error("Update module error:", error);
    return {
      success: false,
      error: "Impossible de mettre à jour le module",
    };
  }
}

// Delete a module
export async function deleteModule(moduleId: number) {
  try {
    // First get the module to know which formation to revalidate
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { formationId: true, _count: { select: { courses: true } } }
    });

    if (!moduleData) {
      return {
        success: false,
        error: "Module non trouvé",
      };
    }

    // Check if module has courses
    if (moduleData._count.courses > 0) {
      return {
        success: false,
        error: "Impossible de supprimer un module contenant des cours. Supprimez d'abord tous les cours.",
      };
    }

    await prisma.module.delete({
      where: { id: moduleId }
    });

    // Revalidate paths
    revalidatePath(`/dashboard/formations/${moduleData.formationId}/modules`);
    revalidatePath(`/dashboard/formations/${moduleData.formationId}`);

    return {
      success: true,
      message: "Module supprimé avec succès",
    };
  } catch (error) {
    console.error("Delete module error:", error);
    return {
      success: false,
      error: "Impossible de supprimer le module",
    };
  }
}

// Reorder modules
export async function reorderModules(formationId: number, moduleOrders: { id: number; order: number }[]) {
  try {
    await prisma.$transaction(
      moduleOrders.map(({ id, order }) =>
        prisma.module.update({
          where: { id },
          data: { order }
        })
      )
    );

    revalidatePath(`/dashboard/formations/${formationId}/modules`);
    revalidatePath(`/dashboard/formations/${formationId}`);

    return {
      success: true,
      message: "Ordre des modules mis à jour",
    };
  } catch (error) {
    console.error("Reorder modules error:", error);
    return {
      success: false,
      error: "Impossible de réorganiser les modules",
    };
  }
}

// Duplicate a module
export async function duplicateModule(moduleId: number) {
  try {
    const originalModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        courses: true
      }
    });

    if (!originalModule) {
      return {
        success: false,
        error: "Module non trouvé",
      };
    }

    // Get highest order for the formation
    const highestOrder = await prisma.module.findFirst({
      where: { formationId: originalModule.formationId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    const newOrder = highestOrder ? highestOrder.order + 1 : 1;

    // Create new module with duplicated data
    const duplicatedModule = await prisma.module.create({
      data: {
        title: `${originalModule.title} (Copie)`,
        description: originalModule.description,
        level: originalModule.level,
        formationId: originalModule.formationId,
        order: newOrder,
        status: Status.DRAFT, // Always start as draft
      },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    // Duplicate courses if any (simplified to avoid JsonValue issues)
    if (originalModule.courses.length > 0) {
      await prisma.$transaction(
        originalModule.courses.map((course) =>
          prisma.course.create({
            data: {
              title: course.title,
              introduction: course.introduction,
              objective: course.objective,
              videoTitle: course.videoTitle,
              videoUrl: course.videoUrl,
              moduleId: duplicatedModule.id,
              order: course.order,
            }
          })
        )
      );
    }

    revalidatePath(`/dashboard/formations/${originalModule.formationId}/modules`);
    revalidatePath(`/dashboard/formations/${originalModule.formationId}`);

    return {
      success: true,
      data: duplicatedModule,
      message: "Module dupliqué avec succès",
    };
  } catch (error) {
    console.error("Duplicate module error:", error);
    return {
      success: false,
      error: "Impossible de dupliquer le module",
    };
  }
}

// Get modules list for a formation (already exists in courses/actions.ts but moving here for better organization)
export async function getModulesList(formationId: number) {
  try {
    const modules = await prisma.module.findMany({
      where: { formationId: formationId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    return { 
      success: true, 
      data: modules 
    };
  } catch (error) {
    console.error("Get modules list error:", error);
    return { 
      success: false, 
      error: "Impossible de récupérer les modules", 
      data: [] 
    };
  }
}
