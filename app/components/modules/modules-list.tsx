import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  BookOpen, 
  Settings,
  Play,
  Copy,
  GraduationCap,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Calendar,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteModule, duplicateModule } from "@/app/actions/modules/actions";
import { Level, Status } from "@prisma/client";

// Mock data - REMOVE THIS SECTION
// const modules = [...]

// Define expected data structure based on server action
interface ModuleListItem {
  id: number;
  title: string;
  description: string | null;
  order: number;
  level: Level;
  status: Status;
  formationId: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    courses: number;
  };
}

interface ModulesListProps {
  formationId: string;
  modules: ModuleListItem[];
}

// Helper function to get level information
const getLevelInfo = (level: Level): { 
  label: string; 
  color: string;
  icon: React.ElementType;
  bgColor: string;
} => {
  switch (level) {
    case "BEGINNER":
      return { 
        label: "Débutant", 
        color: "text-green-600 dark:text-green-400",
        icon: BookOpen,
        bgColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      };
    case "INTERMEDIATE":
      return { 
        label: "Intermédiaire", 
        color: "text-blue-600 dark:text-blue-400",
        icon: GraduationCap,
        bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      };
    case "ADVANCED":
      return { 
        label: "Avancé", 
        color: "text-purple-600 dark:text-purple-400",
        icon: Star,
        bgColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      };
    default:
      return { 
        label: level, 
        color: "text-muted-foreground",
        icon: BookOpen,
        bgColor: "bg-muted"
      };
  }
};

// Helper function to assess module readiness
const getModuleReadiness = (module: ModuleListItem): { 
  status: "ready" | "needs-work" | "empty"; 
  label: string; 
  color: string;
  icon: React.ElementType;
  suggestions: string[];
} => {
  const hasCourses = module._count.courses > 0;
  const hasDescription = module.description && module.description.length > 20;
  const isPublished = module.status === "PUBLISHED";
  
  const suggestions: string[] = [];
  
  // Empty state - no courses
  if (!hasCourses) {
    return {
      status: "empty",
      label: "Aucun cours",
      color: "text-red-600 dark:text-red-400",
      icon: AlertCircle,
      suggestions: ["Ajoutez des cours pour commencer"]
    };
  }
  
  // Check what's missing
  if (!hasDescription) suggestions.push("Complétez la description");
  if (!isPublished) suggestions.push("Publiez le module");
  
  // Ready state - everything is complete
  if (hasCourses && hasDescription && isPublished) {
    return {
      status: "ready",
      label: "Prêt pour diffusion",
      color: "text-green-600 dark:text-green-400",
      icon: CheckCircle2,
      suggestions: ["Module complet et accessible aux étudiants"]
    };
  }
  
  // Needs work - has courses but missing other elements
  return {
    status: "needs-work",
    label: "En développement",
    color: "text-orange-600 dark:text-orange-400",
    icon: Clock,
    suggestions
  };
};

// Handle module deletion
const handleDeleteModule = async (moduleId: number, moduleTitle: string) => {
  const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le module "${moduleTitle}" ?`);
  if (!confirmed) return;

  const loadingToast = toast.loading("Suppression en cours...");
  
  try {
    const result = await deleteModule(moduleId);
    
    if (result.success) {
      toast.dismiss(loadingToast);
      toast.success("Module supprimé avec succès");
      // The page will automatically refresh due to revalidatePath in the action
    } else {
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la suppression", {
        description: result.error
      });
    }
  } catch (_error) {
    console.error("Error deleting module:", _error);
    toast.dismiss(loadingToast);
    toast.error("Erreur lors de la suppression");
  }
};

// Handle module duplication
const handleDuplicateModule = async (moduleId: number, moduleTitle: string) => {
  const loadingToast = toast.loading("Duplication en cours...");
  
  try {
    const result = await duplicateModule(moduleId);
    
    if (result.success) {
      toast.dismiss(loadingToast);
      toast.success("Module dupliqué avec succès", {
        description: `"${moduleTitle}" a été dupliqué`
      });
    } else {
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la duplication", {
        description: result.error
      });
    }
  } catch (_error) {  
    console.error("Error duplicating module:", _error);
    toast.dismiss(loadingToast);
    toast.error("Erreur lors de la duplication");
  }
};

export function ModulesList({ formationId, modules }: ModulesListProps) {
  if (modules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">Aucun module créé</h3>
        <p className="mb-4 max-w-md mx-auto">
          Commencez par créer votre premier module pour structurer votre formation.
        </p>
        <Link href={`/dashboard/formations/${formationId}/modules/new`}>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Créer un module
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {modules.map((module) => {
        const levelInfo = getLevelInfo(module.level);
        const readiness = getModuleReadiness(module);
        const ReadinessIcon = readiness.icon;
        const LevelIcon = levelInfo.icon;
        
        return (
          <Card key={module.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant={module.status === "PUBLISHED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {module.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </Badge>
                    <Badge
                      className={`text-xs ${levelInfo.bgColor}`}
                      variant="outline"
                    >
                      <LevelIcon className="h-3 w-3 mr-1" />
                      {levelInfo.label}
                    </Badge>
                  </div>
                  
                  <Link 
                    href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`}
                    className="block group-hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                      {module.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                    <ArrowUpDown className="h-3 w-3" />
                    <span>Module {module.order}</span>
                  </div>
                  
                  {module.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {module.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <Link href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`}>
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Gérer les cours
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href={`/dashboard/formations/${formationId}/modules/${module.id}/edit`}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier le module
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuItem onClick={() => handleDuplicateModule(module.id, module.title)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Dupliquer
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteModule(module.id, module.title)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {module._count.courses}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {module._count.courses === 1 ? "Cours" : "Cours"}
                  </p>
                </div>
                
                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    {module.order}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Ordre
                  </p>
                </div>
                
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    0
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Étudiants
                  </p>
                </div>
              </div>

              {/* Module Readiness Status */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center space-x-2 mb-2">
                  <ReadinessIcon className={`h-4 w-4 ${readiness.color}`} />
                  <span className={`text-sm font-medium ${readiness.color}`}>
                    {readiness.label}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {readiness.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link href={`/dashboard/formations/${formationId}/modules/${module.id}/courses`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Cours
                  </Button>
                </Link>
                
                <Link href={`/dashboard/formations/${formationId}/modules/${module.id}/edit`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Pencil className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                </Link>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(module.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Play className="h-3 w-3" />
                  <span>0% completé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
