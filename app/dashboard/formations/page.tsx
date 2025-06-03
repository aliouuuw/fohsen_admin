import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Plus, Search, Filter, BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"
import { FormationsList } from "@/app/components/formations/formations-list"
import { Input } from "@/app/components/ui/input"
import { getFormationsList } from "@/app/actions/formations/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

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

// This is a server component because we are fetching data directly
export default async function FormationsPage() {
  const result = await getFormationsList();
  const formations = result.success ? result.data : [];

  // Calculate stats
  const stats = {
    total: formations.length,
    published: formations.filter(f => f.status === "PUBLISHED").length,
    draft: formations.filter(f => f.status === "DRAFT").length,
    totalModules: formations.reduce((sum, f) => sum + f._count.modules, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Formations</h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les formations pour les agents de santé communautaires
          </p>
        </div>
        <Link href="/dashboard/formations/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Formation
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publiées</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Filter className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{stats.totalModules}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Empty State */}
      {formations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-20 w-20 text-muted-foreground/50 mb-6" />
            <h3 className="text-xl font-semibold mb-3">Aucune formation créée</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-lg leading-relaxed">
              Commencez par créer votre première formation pour les agents de santé communautaires.
              Les formations vous permettent d&apos;organiser votre contenu en modules et cours structurés.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/formations/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première formation
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Voir le guide de démarrage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formations Grid */}
      {formations.length > 0 && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Mes Formations ({formations.length})</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérez et organisez vos contenus de formation
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une formation..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
              
              {/* Filter Tabs */}
              <Tabs defaultValue="all" className="mt-4">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all" className="text-xs">
                    Toutes ({formations.length})
                  </TabsTrigger>
                  <TabsTrigger value="published" className="text-xs">
                    Publiées ({stats.published})
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs">
                    Brouillons ({stats.draft})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  <FormationsList formations={formations as unknown as FormationListItem[]} />
                </TabsContent>
                
                <TabsContent value="published" className="mt-6">
                  <FormationsList 
                    formations={formations.filter(f => f.status === "PUBLISHED") as unknown as FormationListItem[]} 
                  />
                </TabsContent>
                
                <TabsContent value="draft" className="mt-6">
                  <FormationsList 
                    formations={formations.filter(f => f.status === "DRAFT") as unknown as FormationListItem[]} 
                  />
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                Conseils pour créer des formations efficaces
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Organisez votre contenu en modules logiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Définissez une note de passage adaptée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Ajoutez des images de couverture attrayantes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Commencez en mode brouillon pour tester</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}