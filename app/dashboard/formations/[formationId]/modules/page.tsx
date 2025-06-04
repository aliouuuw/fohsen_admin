import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Plus, ArrowLeft, Book, BookOpen, Target, GraduationCap } from "lucide-react"
import { ModulesList } from "@/app/components/modules/modules-list"
import Link from "next/link"
import { getModulesList } from "@/app/actions/modules/actions"
import { getFormation } from "@/app/actions/formations/actions"
import { notFound } from "next/navigation"
import { Level, Status } from "@prisma/client"

export interface ModuleListItem {
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

interface ModulesPageProps {
  params: { formationId: string };
}

export default async function FormationModulesPage({ params }: ModulesPageProps) {
  const formationId = parseInt(params.formationId, 10);

  if (isNaN(formationId)) {
    console.error("Invalid formationId:", params.formationId);
    notFound();
  }

  // Fetch both modules and formation data
  const [modulesResult, formationResult] = await Promise.all([
    getModulesList(formationId),
    getFormation(formationId)
  ]);

  if (!formationResult.success || !formationResult.data) {
    notFound();
  }

  const formation = formationResult.data;
  const modules = modulesResult.success ? modulesResult.data : [];

  // Calculate stats
  const stats = {
    total: modules.length,
    published: modules.filter(m => m.status === "PUBLISHED").length,
    draft: modules.filter(m => m.status === "DRAFT").length,
    totalCourses: modules.reduce((sum, m) => sum + m._count.courses, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/formations/${formationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la formation
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Modules</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les modules pour <span className="font-medium">{formation.title}</span> • {modules.length} modules
            </p>
          </div>
        </div>
        <Link href={`/dashboard/formations/${params.formationId}/modules/new`}>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Module
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publiés</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <GraduationCap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
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
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cours</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State or Modules List */}
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Book className="h-20 w-20 text-muted-foreground/50 mb-6" />
            <h3 className="text-xl font-semibold mb-3">Aucun module créé</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-lg leading-relaxed">
              Structurez votre formation en créant des modules thématiques. 
              Chaque module peut contenir plusieurs cours pour organiser votre contenu pédagogique.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/dashboard/formations/${params.formationId}/modules/new`}>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier module
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Guide des modules
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Modules Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Modules de la formation ({modules.length})</span>
                </CardTitle>
                
                <div className="flex items-center space-x-3">
                  <Link href={`/dashboard/formations/${params.formationId}/modules/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau module
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Modules Grid */}
          <ModulesList formationId={params.formationId} modules={modules} />
        </div>
      )}

      {/* Help Section */}
      <Card  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                Conseils pour organiser vos modules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Organisez par thèmes ou compétences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Respectez une progression logique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Adaptez le niveau de difficulté</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Ajoutez des descriptions claires</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}