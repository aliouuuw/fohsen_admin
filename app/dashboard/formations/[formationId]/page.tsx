import { notFound } from 'next/navigation';
import { getFormation } from "@/app/actions/formations/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Edit, Plus, Book, Users, Award, Settings, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FormationPageProps {
  params: Promise<{ formationId: string }>;
}

export default async function FormationOverviewPage({ params }: FormationPageProps) {
  const { formationId } = await params;
  const formationIdInt = parseInt(formationId, 10);

  if (isNaN(formationIdInt)) {
    notFound();
  }

  const result = await getFormation(formationIdInt);

  if (!result.success || !result.data) {
    notFound();
  }

  const formation = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <h1 className="text-3xl font-bold">{formation.title}</h1>
              <Badge variant={formation.status === "PUBLISHED" ? "default" : "secondary"}>
                {formation.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Vue d&apos;ensemble de la formation • {formation._count.modules} modules
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/formations/${formation.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Link href={`/dashboard/formations/${formation.id}/modules`}>
            <Button>
              <Book className="h-4 w-4 mr-2" />
              Gérer les modules
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/dashboard/formations/${formation.id}/modules`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Modules</h3>
                    <p className="text-sm text-muted-foreground">{formation._count.modules} modules</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/formations/${formation.id}/modules/new`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nouveau Module</h3>
                    <p className="text-sm text-muted-foreground">Ajouter du contenu</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/formations/${formation.id}/edit`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Paramètres</h3>
                    <p className="text-sm text-muted-foreground">Modifier la formation</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formation.thumbnail && (
                <div>
                  <Image
                    src={formation.thumbnail}
                    alt={formation.title}
                    className="w-full h-48 object-cover rounded-lg border"
                    width={100}
                    height={100}
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {formation.description || "Aucune description disponible."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modules List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Modules ({formation._count.modules})</span>
                </CardTitle>
                <Link href={`/dashboard/formations/${formation.id}/modules/new`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau module
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {formation.modules && formation.modules.length > 0 ? (
                <div className="space-y-3">
                  {formation.modules.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module._count.courses} cours • Niveau {module.level.toLowerCase()} 
                            {module.description && ` • ${module.description.substring(0, 50)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/formations/${formation.id}/modules/${module.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </Link>
                        <Link href={`/dashboard/formations/${formation.id}/modules/${module.id}/courses`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir les cours
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Aucun module</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par créer votre premier module pour cette formation.
                  </p>
                  <Link href={`/dashboard/formations/${formation.id}/modules/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer le premier module
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Statistiques</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Modules</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formation._count.modules}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Inscriptions</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">{formation._count.enrollments}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium">Certificats</span>
                </div>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{formation._count.certificates}</span>
              </div>
            </CardContent>
          </Card>

          {/* Formation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Note de passage</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formation.passingGrade}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge variant={formation.status === "PUBLISHED" ? "default" : "secondary"}>
                    {formation.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-1">Dernière modification</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(formation.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/formations/${formation.id}/modules`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Gérer les modules
                </Button>
              </Link>
              
              <Link href={`/dashboard/formations/${formation.id}/modules/new`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un module
                </Button>
              </Link>
              
              <Link href={`/dashboard/formations/${formation.id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier la formation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 