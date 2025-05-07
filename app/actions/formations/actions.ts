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

// Add other Formation related actions here (create, update, delete)
// Example createFormation action (adapt from earlier if needed):
export async function createFormation(data: {
  title: string;
  description?: string;
  thumbnail?: string;
  passingGrade?: number;
}) {
  try {
    const newFormation = await prisma.formation.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        passingGrade: data.passingGrade,
      },
    });
     revalidatePath('/dashboard/formations', 'page'); // Revalidate the list page

    return { success: true, data: newFormation };
  } catch (error) {
    console.error("Create formation error:", error);
    return { success: false, error: "Failed to create formation" };
  }
}

export async function getFormation(formationId: number) {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
    });

    return { success: true, data: formation };
  } catch (error) {
    console.error("Get formation error:", error);
    return { success: false, error: "Failed to fetch formation" };
  }
}
