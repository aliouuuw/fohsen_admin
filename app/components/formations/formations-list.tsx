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
  Book, 
  Eye, 
  Settings, 
  Users,
  Award,
  Calendar,
  Target,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Temporary mock data
// const formations = [
//   {
//     id: "1",
//     title: "Formation en Santé Communautaire",
//     totalModules: 5,
//     totalStudents: 10,
//     status: "active",
//     lastUpdated: "2024-03-15",
//   },
//   {
//     id: "2",
//     title: "Formation en Soins de Santé Primaires",
//     totalModules: 3,
//     totalStudents: 75,
//     status: "draft",
//     lastUpdated: "2024-03-14",
//   },
// ]

// Define the expected data structure based on the server action
interface FormationListItem {
  id: number; // Match schema ID type
  title: string;
  description: string | null;
  thumbnail: string | null;
  passingGrade: number;
  createdAt: string; // Use string for date display
  updatedAt: string; // Use string for date display
  _count: {
    modules: number; // From include _count
  };
  status: "PUBLISHED" | "DRAFT"; // Add status if needed
}

interface FormationsListProps {
  formations: FormationListItem[]; // Accept fetched data as a prop
}

// Helper function to get difficulty level based on passing grade
const getDifficultyLevel = (grade: number): { label: string; color: string } => {
  if (grade <= 65) return { label: "Débutant", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
  if (grade <= 75) return { label: "Intermédiaire", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
  if (grade <= 85) return { label: "Avancé", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" };
  return { label: "Expert", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
};

// 🆕 NEW: Helper function to assess formation readiness
const getFormationReadiness = (formation: FormationListItem): { 
  status: "ready" | "needs-work" | "empty"; 
  label: string; 
  color: string;
  icon: React.ElementType;
  suggestions: string[];
} => {
  const hasModules = formation._count.modules > 0;
  const hasDescription = formation.description && formation.description.length > 20;
  const hasThumbnail = formation.thumbnail;
  const isPublished = formation.status === "PUBLISHED";
  
  const suggestions: string[] = [];
  
  // Empty state - no modules
  if (!hasModules) {
    return {
      status: "empty",
      label: "Aucun contenu",
      color: "text-red-600 dark:text-red-400",
      icon: AlertCircle,
      suggestions: ["Ajoutez des modules pour commencer"]
    };
  }
  
  // Check what's missing
  if (!hasThumbnail) suggestions.push("Ajoutez une image de couverture");
  if (!hasDescription) suggestions.push("Complétez la description");
  if (!isPublished) suggestions.push("Publiez la formation");
  
  // Ready state - everything is complete
  if (hasModules && hasDescription && hasThumbnail && isPublished) {
    return {
      status: "ready",
      label: "Prête à diffuser",
      color: "text-green-600 dark:text-green-400",
      icon: CheckCircle2,
      suggestions: ["Formation complète et accessible aux étudiants"]
    };
  }
  
  // Needs work - has modules but missing other elements
  return {
    status: "needs-work",
    label: "En développement",
    color: "text-orange-600 dark:text-orange-400",
    icon: Clock,
    suggestions
  };
};

export function FormationsList({ formations }: FormationsListProps) {
  if (formations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">Aucune formation trouvée</h3>
        <p className="mb-4 max-w-md mx-auto">
          Commencez par créer votre première formation pour les agents de santé communautaires.
        </p>
        <Link href="/dashboard/formations/new">
          <Button>
            <Book className="h-4 w-4 mr-2" />
            Créer une formation
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {formations.map((formation) => {
        const difficulty = getDifficultyLevel(formation.passingGrade);
        const readiness = getFormationReadiness(formation); // 🆕 NEW
        const ReadinessIcon = readiness.icon;
        
        return (
          <Card key={formation.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant={formation.status === "PUBLISHED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {formation.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                    </Badge>
                    <Badge
                      className={`text-xs ${difficulty.color}`}
                      variant="outline"
                    >
                      {difficulty.label}
                    </Badge>
                  </div>
                  
                  <Link 
                    href={`/dashboard/formations/${formation.id}`}
                    className="block group-hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                      {formation.title}
                    </h3>
                  </Link>
                  
                  {formation.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {formation.description}
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
                    
                    <Link href={`/dashboard/formations/${formation.id}`}>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href={`/dashboard/formations/${formation.id}/modules`}>
                      <DropdownMenuItem>
                        <Book className="mr-2 h-4 w-4" />
                        Gérer les modules
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href={`/dashboard/formations/${formation.id}/edit`}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier la formation
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres avancés
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Formation Thumbnail */}
              {formation.thumbnail ? (
                <div className="mb-4">
                  <Image
                    src={formation.thumbnail}
                    alt={formation.title}
                    className="w-full h-32 object-cover rounded-lg border"
                    width={100}
                    height={100}
                  />
                </div>
              ) : (
                <div className="mb-4 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary/40" />
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Book className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {formation._count.modules}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {formation._count.modules === 1 ? "Module" : "Modules"}
                  </p>
                </div>
                
                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    {formation.passingGrade}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Passage
                  </p>
                </div>
                
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    0
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Inscrits
                  </p>
                </div>
              </div>

              {/* 🆕 NEW: Formation Readiness Status (replacing progress bar) */}
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
                <Link href={`/dashboard/formations/${formation.id}/modules`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Book className="h-3 w-3 mr-1" />
                    Modules
                  </Button>
                </Link>
                
                <Link href={`/dashboard/formations/${formation.id}/edit`} className="flex-1">
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
                    {new Date(formation.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Award className="h-3 w-3" />
                  <span>0 certificats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
