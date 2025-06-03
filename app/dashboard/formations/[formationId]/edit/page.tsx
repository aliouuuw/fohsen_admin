"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, Upload, Save, Trash2, Eye, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { getFormation, updateFormation, deleteFormation, publishFormation } from "@/app/actions/formations/actions";
import Link from "next/link";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import Image from "next/image";

interface FormationData {
  id: number;
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

export default function EditFormationPage() {
  const router = useRouter();
  const params = useParams();
  const formationId = parseInt(params.formationId as string, 10);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formation, setFormation] = useState<FormationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load formation data
  useEffect(() => {
    const loadFormation = async () => {
      try {
        toast.loading("Chargement de la formation...", { id: "load-formation" });
        
        const result = await getFormation(formationId);
        if (result.success && result.data) {
          setFormation({
            id: result.data.id,
            title: result.data.title,
            description: result.data.description || "",
            thumbnail: result.data.thumbnail || "",
            passingGrade: result.data.passingGrade,
            status: result.data.status,
          });
          toast.success("Formation chargée", { id: "load-formation" });
        } else {
          toast.error("Formation introuvable", { id: "load-formation" });
          router.push("/dashboard/formations");
        }
      } catch (error) {
        console.error("Load formation error:", error);
        toast.error("Erreur de chargement", { id: "load-formation" });
        router.push("/dashboard/formations");
      } finally {
        setLoading(false);
      }
    };

    if (formationId) {
      loadFormation();
    }
  }, [formationId, router]);

  const updateFormationField = (field: keyof Omit<FormationData, 'id'>, value: string | number) => {
    if (formation) {
      setFormation({
        ...formation,
        [field]: value,
      });
      setHasChanges(true);
      
      // Clear errors when user starts typing
      if (errors[field as keyof ValidationErrors]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formation) return false;
    
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

  const handleUpdateFormation = async () => {
    if (!formation || !validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setIsLoading(true);
      
      toast.loading("Sauvegarde en cours...", { id: "update-formation" });

      const result = await updateFormation(formation.id, {
        title: formation.title,
        description: formation.description,
        thumbnail: formation.thumbnail || undefined,
        passingGrade: formation.passingGrade,
        status: formation.status,
      });

      if (result.success) {
        toast.success("Formation mise à jour!", {
          id: "update-formation",
          description: "Les modifications ont été sauvegardées avec succès.",
        });
        setHasChanges(false);
      } else {
        toast.error("Erreur lors de la sauvegarde", {
          id: "update-formation",
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      console.error("Update formation error:", error);
      toast.error("Erreur lors de la sauvegarde", {
        id: "update-formation",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFormation = async () => {
    if (!formation) return;

    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer la formation "${formation.title}" ? Cette action est irréversible et supprimera tous les modules et cours associés.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      toast.loading("Suppression en cours...", { id: "delete-formation" });
      
      const result = await deleteFormation(formation.id);

      if (result.success) {
        toast.success("Formation supprimée", {
          id: "delete-formation",
          description: `La formation "${formation.title}" a été supprimée avec succès.`,
        });
        router.push("/dashboard/formations");
      } else {
        toast.error("Erreur lors de la suppression", {
          id: "delete-formation",
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      console.error("Delete formation error:", error);
      toast.error("Erreur lors de la suppression", {
        id: "delete-formation",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!formation) return;

    try {
      setIsPublishing(true);
      const newStatus = formation.status === "PUBLISHED";
      const actionText = newStatus ? "Mise en brouillon" : "Publication";
      
      toast.loading(`${actionText} en cours...`, { id: "publish-formation" });
      
      const result = await publishFormation(formation.id, !newStatus);

      if (result.success && result.data) {
        setFormation({
          ...formation,
          status: result.data.status,
        });
        toast.success(`${actionText} réussie!`, {
          id: "publish-formation",
          description: `La formation est maintenant ${result.data.status === "PUBLISHED" ? "publiée" : "en brouillon"}.`,
        });
      } else {
        toast.error(`Erreur lors de la ${actionText.toLowerCase()}`, {
          id: "publish-formation",
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      console.error("Publish formation error:", error);
      toast.error("Erreur lors du changement de statut", {
        id: "publish-formation",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const isFormValid = () => {
    return formation?.title.trim() && formation?.description.trim() && Object.keys(errors).length === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement de la formation...</div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Formation introuvable</div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">Modifier la Formation</h1>
              <Badge variant={formation.status === "PUBLISHED" ? "default" : "secondary"}>
                {formation.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Modifier les détails de la formation &quot;{formation.title}&quot;
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/formations/${formation.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
          </Link>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez des modifications non sauvegardées. N&apos;oubliez pas de sauvegarder vos changements.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
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
              <CardTitle>Image de couverture</CardTitle>
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
                    ? "La formation est en mode brouillon" 
                    : "La formation est disponible pour les étudiants"
                  }
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePublishToggle}
                  disabled={isPublishing}
                >
                  {isPublishing ? "En cours..." : 
                   formation.status === "PUBLISHED" ? "Mettre en brouillon" : "Publier"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleUpdateFormation}
                disabled={!isFormValid() || isLoading || !hasChanges}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/formations/${formation.id}/modules`)}
              >
                Gérer les modules
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteFormation}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Suppression..." : "Supprimer la formation"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href={`/dashboard/formations/${formation.id}/modules`}
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    Voir les modules
                  </Button>
                </Link>
                <Link 
                  href={`/dashboard/formations/${formation.id}`}
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    Aperçu de la formation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 