"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, Upload, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { createFormation } from "@/app/actions/formations/actions";
import Link from "next/link";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import Image from "next/image";

interface FormationData {
  title: string;
  description: string;
  thumbnail: string;
  passingGrade: number;
  status: "DRAFT" | "PUBLISHED";
}

interface ValidationErrors {
  title?: string;
  description?: string;
}

export default function NewFormationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formation, setFormation] = useState<FormationData>({
    title: "",
    description: "",
    thumbnail: "",
    passingGrade: 70,
    status: "DRAFT",
  });

  const updateFormationField = (field: keyof FormationData, value: string | number) => {
    setFormation({
      ...formation,
      [field]: value,
    });
    
    // Clear errors when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formation.title.trim()) {
      newErrors.title = "Le titre est obligatoire";
    } else if (formation.title.trim().length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères";
    }
    
    if (!formation.description.trim()) {
      newErrors.description = "La description est obligatoire";
    } else if (formation.description.trim().length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateFormation = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setIsLoading(true);
      
      toast.loading("Création de la formation en cours...", {
        id: "create-formation"
      });

      const result = await createFormation({
        title: formation.title,
        description: formation.description,
        thumbnail: formation.thumbnail || undefined,
        passingGrade: formation.passingGrade,
        status: formation.status,
      });

      if (result.success && result.data) {
        toast.success("Formation créée avec succès!", {
          id: "create-formation",
          description: `La formation "${formation.title}" a été créée et est prête pour l'ajout de modules.`,
        });
        
        // Navigate with a slight delay to show the success message
        setTimeout(() => {
          router.push(`/dashboard/formations/${result.data.id}/modules`);
        }, 1000);
      } else {
        toast.error("Erreur lors de la création", {
          id: "create-formation",
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      console.error("Create formation error:", error);
      toast.error("Erreur lors de la création", {
        id: "create-formation",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formation.title.trim() && formation.description.trim() && Object.keys(errors).length === 0;
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 4; // title, description, passingGrade, status
    
    if (formation.title.trim()) completed++;
    if (formation.description.trim()) completed++;
    if (formation.passingGrade) completed++;
    if (formation.thumbnail) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/formations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux formations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Nouvelle Formation</h1>
            <p className="text-muted-foreground">
              Créer une nouvelle formation pour les agents de santé communautaires
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${getCompletionPercentage()}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Progression: {getCompletionPercentage()}% terminé
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Informations de base</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Titre de la formation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formation.title}
                  onChange={(e) => updateFormationField("title", e.target.value)}
                  placeholder="Ex: Formation en santé maternelle et infantile"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.title}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formation.description}
                  onChange={(e) => updateFormationField("description", e.target.value)}
                  placeholder="Décrivez les objectifs et le contenu de cette formation..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.description}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label htmlFor="passingGrade">Note de passage (%)</Label>
                <Select
                  value={formation.passingGrade.toString()}
                  onValueChange={(value) => updateFormationField("passingGrade", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la note de passage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60% - Débutant</SelectItem>
                    <SelectItem value="65">65% - Facile</SelectItem>
                    <SelectItem value="70">70% - Standard</SelectItem>
                    <SelectItem value="75">75% - Modéré</SelectItem>
                    <SelectItem value="80">80% - Avancé</SelectItem>
                    <SelectItem value="85">85% - Difficile</SelectItem>
                    <SelectItem value="90">90% - Expert</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Note minimale requise pour obtenir la certification
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image de couverture (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formation.thumbnail ? (
                  <div className="relative">
                    <Image
                      src={formation.thumbnail}
                      alt="Formation thumbnail"
                      className="w-full h-48 object-cover rounded-lg border"
                      width={100}
                      height={100}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => updateFormationField("thumbnail", "")}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Télécharger une image de couverture pour la formation
                      </p>
                      <UploadButton
                        endpoint="courseImage"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]) {
                            updateFormationField("thumbnail", res[0].url);
                            toast.success("Image téléchargée avec succès!");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          console.error('Upload Error:', error);
                          toast.error('Erreur lors du téléchargement de l\'image');
                        }}
                        appearance={{
                          button: "bg-primary text-primary-foreground hover:bg-primary/90",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut de publication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={formation.status}
                  onValueChange={(value: "DRAFT" | "PUBLISHED") => 
                    updateFormationField("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formation.status === "DRAFT" 
                    ? "La formation sera sauvegardée comme brouillon" 
                    : "La formation sera immédiatement disponible pour les étudiants"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleCreateFormation}
                disabled={!isFormValid() || isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Création..." : "Créer la formation"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/formations")}
                disabled={isLoading}
              >
                Annuler
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <span className="text-muted-foreground">Créer la formation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">2</div>
                  <span className="text-muted-foreground">Ajouter des modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">3</div>
                  <span className="text-muted-foreground">Créer des cours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">4</div>
                  <span className="text-muted-foreground">Publier la formation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 