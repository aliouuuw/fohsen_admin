"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createCourse } from "@/app/actions/courses/actions";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.formationId as string;
  const moduleId = params.moduleId as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    introduction: "",
    objective: "",
  });

  const handleCreateCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error("Le titre du cours est requis");
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await createCourse({
        title: courseData.title,
        introduction: courseData.introduction,
        objective: courseData.objective,
        moduleId: moduleId,
      });

      if (result.success && result.data) {
        toast.success("Cours créé avec succès!");
        // Redirect to the edit page where users can add content, quiz, and resources
        router.push(`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${result.data.id}/edit`);
      } else {
        throw new Error(result.error || "Erreur lors de la création du cours");
      }
    } catch (error) {
      console.error("Create course error:", error);
      toast.error(`Erreur: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = courseData.title.trim().length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Créer un nouveau cours</h1>
            <p className="text-muted-foreground mt-1">
              Commencez par les informations de base, puis ajoutez le contenu détaillé
            </p>
          </div>
        </div>
      </div>

      {/* Course Creation Form */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informations de base
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Créez d&apos;abord le cours, puis vous pourrez ajouter le contenu, les quiz et les ressources
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                Titre du cours *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Introduction aux soins primaires"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choisissez un titre clair et descriptif pour votre cours
              </p>
            </div>

            <div>
              <Label htmlFor="introduction" className="text-base font-medium">
                Introduction
              </Label>
              <Textarea
                id="introduction"
                placeholder="Brève introduction qui présente le cours aux apprenants..."
                value={courseData.introduction}
                onChange={(e) => setCourseData(prev => ({ ...prev, introduction: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="objective" className="text-base font-medium">
                Objectif d&apos;apprentissage
              </Label>
              <Textarea
                id="objective"
                placeholder="Que vont apprendre les étudiants à la fin de ce cours ?"
                value={courseData.objective}
                onChange={(e) => setCourseData(prev => ({ ...prev, objective: e.target.value }))}
                rows={3}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Décrivez clairement les compétences ou connaissances acquises
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateCourse}
                disabled={!isFormValid || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  "Création..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le cours
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Prochaines étapes</h3>
                <p className="text-sm text-blue-700">
                  Après avoir créé le cours, vous serez redirigé vers l&apos;éditeur complet où vous pourrez:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside ml-4">
                  <li>Ajouter du contenu riche avec l&apos;éditeur de texte</li>
                  <li>Créer des quiz d&apos;évaluation</li>
                  <li>Téléverser des ressources et documents</li>
                  <li>Prévisualiser le cours final</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
