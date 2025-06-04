"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import {
  ArrowLeft,
  Book,
  Lightbulb,
  Users,
  Loader2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Star,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getModule, updateModule, deleteModule } from "@/app/actions/modules/actions";
import { Level, Status } from "@prisma/client";

interface FormData {
  title: string;
  description: string;
  level: Level;
  status: Status;
}

interface ModuleData {
  id: number;
  title: string;
  description: string | null;
  level: Level;
  status: Status;
  order: number;
  createdAt: Date;
  formation?: {
    id: number;
    title: string;
  };
  _count?: {
    courses: number;
  };
}

// Level options with French labels and descriptions
const levelOptions = [
  {
    value: "BEGINNER" as Level,
    label: "Débutant",
    icon: BookOpen,
    description: "Concepts de base et introduction",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    value: "INTERMEDIATE" as Level,
    label: "Intermédiaire", 
    icon: GraduationCap,
    description: "Connaissances approfondies",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    value: "ADVANCED" as Level,
    label: "Avancé",
    icon: Star,
    description: "Expertise et cas complexes",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
];

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const formationId = parseInt(params.formationId as string, 10);
  const moduleId = parseInt(params.moduleId as string, 10);

  const [module, setModule] = useState<ModuleData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    level: "BEGINNER",
    status: "DRAFT",
  });

  const [originalData, setOriginalData] = useState<FormData>({
    title: "",
    description: "",
    level: "BEGINNER",
    status: "DRAFT",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load module data
  useEffect(() => {
    const loadModule = async () => {
      try {
        const result = await getModule(moduleId);
        
        if (result.success && result.data) {
          const moduleData = result.data;
          setModule(moduleData);
          
          const initialFormData: FormData = {
            title: moduleData.title,
            description: moduleData.description || "",
            level: moduleData.level as Level,
            status: moduleData.status as Status,
          };
          
          setFormData(initialFormData);
          setOriginalData(initialFormData);
        } else {
          toast.error("Module non trouvé");
          router.push(`/dashboard/formations/${formationId}/modules`);
        }
      } catch (error) {
        console.error("Load module error:", error);
        toast.error("Erreur lors du chargement du module");
        router.push(`/dashboard/formations/${formationId}/modules`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [moduleId, formationId, router]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.level !== originalData.level ||
      formData.status !== originalData.status;
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Mise à jour en cours...");

    try {
      const result = await updateModule(moduleId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: formData.level,
        status: formData.status,
      });

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Module mis à jour avec succès !");
        setOriginalData(formData);
        setHasUnsavedChanges(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Erreur lors de la mise à jour", {
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la mise à jour");
      console.error("Update module error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle module deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    const loadingToast = toast.loading("Suppression en cours...");

    try {
      const result = await deleteModule(moduleId);

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Module supprimé avec succès");
        router.push(`/dashboard/formations/${formationId}/modules`);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Erreur lors de la suppression", {
          description: result.error
        });
      }
    } catch (error) {
      console.error("Delete module error:", error);
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | Level | Status) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!module) {
    return null;
  }

  const selectedLevel = levelOptions.find(option => option.value === formData.level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
          <Link href={`/dashboard/formations/${formationId}/modules`}>
            <Button variant="outline" size="sm" className="border-muted-foreground/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux modules
            </Button>
          </Link>
          <div className="flex flex-col flex-1 items-center justify-center">
            <h1 className="text-3xl font-bold">Modifier le module</h1>
            <p className="text-muted-foreground mt-1">
              Formation: <span className="font-medium">{module.formation?.title}</span>
            </p>
          </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Modifications non sauvegardées
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Vous avez des modifications non sauvegardées. N&apos;oubliez pas de sauvegarder vos changements.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Informations de base</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Titre du module *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Introduction aux soins de santé communautaires"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez le contenu et les objectifs de ce module..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    rows={4}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/200 caractères minimum
                  </p>
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Level and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Niveau du module *
                    </Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => handleInputChange("level", value as Level)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                <span className="font-medium">{option.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Statut de publication
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange("status", value as Status)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Brouillon</SelectItem>
                        <SelectItem value="PUBLISHED">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Level Preview */}
                {selectedLevel && (
                  <div className={`p-4 rounded-lg border ${selectedLevel.bgColor}`}>
                    <div className="flex items-center space-x-3">
                      <selectedLevel.icon className={`h-6 w-6 ${selectedLevel.color}`} />
                      <div>
                        <h4 className="font-semibold">{selectedLevel.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedLevel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !hasUnsavedChanges}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>

              <Link href={`/dashboard/formations/${formationId}/modules/${moduleId}/courses`}>
                <Button variant="secondary" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gérer les cours
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isSubmitting || isDeleting}
                    className="w-full bg-destructive/90 hover:bg-destructive"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le module
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le module</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.
                      Tous les cours associés seront également supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-muted-foreground/20">Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Module Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques du module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cours:</span>
                <span className="font-medium">{module._count?.courses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ordre:</span>
                <span className="font-medium">Module {module.order}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Créé le:</span>
                <span className="font-medium">
                  {new Date(module.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <Lightbulb className="h-5 w-5" />
                <span>Conseils</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <div>
                  <strong>Titre descriptif :</strong> Utilisez un titre clair qui résume le contenu
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <div>
                  <strong>Description complète :</strong> Détaillez les objectifs d&apos;apprentissage
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <div>
                  <strong>Niveau approprié :</strong> Adaptez selon votre public cible
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 