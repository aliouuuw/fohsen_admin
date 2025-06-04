"use client";

import { useState } from "react";
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
  ArrowLeft,
  Book,
  CheckCircle2,
  Lightbulb,
  Target,
  Users,
  Loader2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Star
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createModule } from "@/app/actions/modules/actions";
import { Level } from "@prisma/client";
import { Progress } from "@/app/components/ui/progress";

interface FormData {
  title: string;
  description: string;
  level: Level | "";
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

export default function NewModulePage() {
  const router = useRouter();
  const params = useParams();
  const formationId = parseInt(params.formationId as string, 10);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    level: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const fields = [
      formData.title.trim(),
      formData.description.trim(),
      formData.level,
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

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

    if (!formData.level) {
      newErrors.level = "Le niveau est requis";
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
    const loadingToast = toast.loading("Création du module en cours...");

    try {
      const result = await createModule({
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: formData.level as Level,
        formationId,
      });

      if (result.success && result.data) {
        toast.dismiss(loadingToast);
        toast.success("Module créé avec succès !", {
          description: "Vous pouvez maintenant ajouter des cours à ce module",
        });
        
        router.push(`/dashboard/formations/${formationId}/modules`);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Erreur lors de la création", {
          description: result.error || "Une erreur inattendue s'est produite",
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la création", {
        description: "Une erreur inattendue s'est produite",
      });
      console.error("Create module error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedLevel = levelOptions.find(option => option.value === formData.level);
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/formations/${formationId}/modules`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux modules
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Créer un nouveau module</h1>
            <p className="text-muted-foreground mt-1">
              Organisez votre contenu pédagogique en modules thématiques
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Progression</span>
                </CardTitle>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </CardHeader>
          </Card>

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

            {/* Level Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Niveau de difficulté</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Niveau du module *
                  </Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={(value) => handleInputChange("level", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez le niveau de difficulté" />
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
                  {errors.level && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.level}</span>
                    </p>
                  )}
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link href={`/dashboard/formations/${formationId}/modules`}>
                <Button variant="outline" disabled={isSubmitting}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Créer le module
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <strong>Titre descriptif :</strong> Utilisez un titre clair qui résume le contenu du module
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <div>
                  <strong>Description détaillée :</strong> Expliquez ce que les étudiants apprendront
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <div>
                  <strong>Niveau approprié :</strong> Choisissez le niveau selon votre public cible
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-muted rounded-full" />
                <span>Créer le module</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 border-2 border-muted rounded-full" />
                <span>Ajouter des cours</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 border-2 border-muted rounded-full" />
                <span>Configurer les quiz</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 border-2 border-muted rounded-full" />
                <span>Publier le module</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 