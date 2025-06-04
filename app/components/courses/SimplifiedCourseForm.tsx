"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import TiptapEditor from './tiptap-editor';
import TiptapRenderer from './TiptapRenderer';
import ResourceManager from '@/app/components/courses/ResourceManager';
import QuizEditor from '@/app/components/courses/QuizEditor';
import { updateCourse, upsertQuiz, syncResources, saveCourseContent } from '@/app/actions/courses/actions';
import { ResourceType, Quiz as PrismaQuiz, Resource as PrismaResource } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { toast } from "sonner";
import { BookOpen, Trophy, FileText, Play, RotateCcw, CheckCircle, XCircle, Save, ArrowLeft } from "lucide-react";

// Form validation schema
const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  introduction: z.string().optional(),
  objective: z.string().optional(),
  order: z.number(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface ResourceFormData {
  title: string;
  type: ResourceType;
  url: string;
  description?: string;
}

interface QuizFormData {
  question: string;
  options: string[];
  correctAnswers: number[];
}

interface SimplifiedCourseFormProps {
  initialData?: CourseFormData & {
    content?: JsonValue;
    quiz?: PrismaQuiz | null;
    resources?: PrismaResource[];
  };
  courseId: string;
}

export default function SimplifiedCourseForm({ initialData, courseId }: SimplifiedCourseFormProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [liveContent, setLiveContent] = useState<JsonValue>(initialData?.content || null);
  const [currentResources, setCurrentResources] = useState<ResourceFormData[]>(
    initialData?.resources?.map(r => ({
      title: r.title,
      type: r.type,
      url: r.url,
      description: r.description || undefined,
    })) || []
  );
  const [currentQuiz, setCurrentQuiz] = useState<QuizFormData | undefined>(
    initialData?.quiz
      ? {
          question: initialData.quiz.question,
          options: initialData.quiz.options as string[],
          correctAnswers: initialData.quiz.correctAnswers as number[],
        }
      : undefined
  );

  // Track changes for quiz and resources
  const [hasQuizChanges, setHasQuizChanges] = useState(false);
  const [hasResourceChanges, setHasResourceChanges] = useState(false);
  const [hasContentChanges, setHasContentChanges] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      introduction: initialData?.introduction || "",
      objective: initialData?.objective || "",
      order: initialData?.order || 0,
    },
  });

  // Calculate if there are any unsaved changes
  const hasChanges = form.formState.isDirty || hasQuizChanges || hasResourceChanges || hasContentChanges;

  const handleSaveAll = async () => {
    const formData = form.getValues();
    setIsSaving(true);
    
    try {
      const numericCourseId = parseInt(courseId, 10);

      // 1. Update basic course details
      const courseUpdateResult = await updateCourse(numericCourseId, {
        title: formData.title,
        introduction: formData.introduction,
        objective: formData.objective,
        order: formData.order,
      });

      if (!courseUpdateResult.success) {
        throw new Error(courseUpdateResult.error || "Failed to update course details");
      }

      // 2. Save content if changed
      if (hasContentChanges && liveContent) {
        const contentResult = await saveCourseContent(numericCourseId, JSON.stringify(liveContent));
        if (!contentResult.success) {
          throw new Error(contentResult.error || "Failed to save content");
        }
      }

      // 3. Upsert Quiz if changed
      if (hasQuizChanges && currentQuiz && currentQuiz.question) {
        const quizResult = await upsertQuiz(numericCourseId, {
          question: currentQuiz.question,
          options: currentQuiz.options as JsonValue,
          correctAnswers: currentQuiz.correctAnswers as JsonValue,
        });
        if (!quizResult.success) {
          throw new Error(quizResult.error || "Failed to save quiz");
        }
      }

      // 4. Sync Resources if changed
      if (hasResourceChanges) {
        const resourcesResult = await syncResources(numericCourseId, currentResources);
        if (!resourcesResult.success) {
          throw new Error(resourcesResult.error || "Failed to save resources");
        }
      }

      toast.success("Cours sauvegardé avec succès!");

      // Reset all change tracking flags after successful save
      setHasQuizChanges(false);
      setHasResourceChanges(false);
      setHasContentChanges(false);
      form.reset(formData); // Reset form state to mark as clean

    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(`Erreur: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Éditer
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6 pb-20">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du cours *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  className="mt-1"
                  placeholder="Entrez le titre du cours"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  {...form.register("introduction")}
                  className="mt-1"
                  placeholder="Brève introduction au cours"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="objective">Objectif d&apos;apprentissage</Label>
                <Textarea
                  id="objective"
                  {...form.register("objective")}
                  className="mt-1"
                  placeholder="Que vont apprendre les étudiants ?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenu du cours
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Créez un contenu riche avec du texte, des images, des vidéos et des éléments interactifs
              </p>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                courseId={courseId}
                initialContent={initialData?.content}
                onSaved={() => {
                  // Content is saved separately, but we track changes for unified save
                  setHasContentChanges(false);
                }}
                onContentChange={(content) => {
                  setLiveContent(content);
                  setHasContentChanges(true);
                }}
                hideIndividualSaveButton={true} // Pass prop to hide individual save button
              />
            </CardContent>
          </Card>

          {/* Resources Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ressources
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents de support, liens utiles et matériel complémentaire
              </p>
            </CardHeader>
            <CardContent>
              <ResourceManager
                courseId={courseId}
                initialResources={currentResources}
                onResourcesChange={(updatedResources) => {
                  setCurrentResources(updatedResources);
                  setHasResourceChanges(true);
                }}
              />
            </CardContent>
          </Card>

          {/* Quiz Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Quiz d&apos;évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test de compréhension pour valider l&apos;apprentissage
              </p>
            </CardHeader>
            <CardContent>
              <QuizEditor
                initialQuiz={currentQuiz}
                onQuizChange={(updatedQuiz) => {
                  setCurrentQuiz(updatedQuiz);
                  setHasQuizChanges(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <CoursePreview 
            courseData={{
              title: form.watch("title") || "Titre du cours",
              introduction: form.watch("introduction") || "",
              objective: form.watch("objective") || "",
              content: liveContent,
              resources: currentResources,
              quiz: currentQuiz,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Back Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => window.history.back()}
          className="shadow-lg bg-white border-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        {/* Save Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleSaveAll}
          disabled={isSaving || !hasChanges}
          className="shadow-lg bg-primary hover:bg-primary/90 min-w-[140px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sauvegarde..." : hasChanges ? "Sauvegarder" : "Sauvegardé"}
        </Button>
      </div>

      {/* Changes Indicator */}
      {hasChanges && !isSaving && (
        <div className="fixed bottom-20 right-6 z-40">
          <div className="bg-amber-100 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm shadow-lg">
            • Modifications non sauvegardées
          </div>
        </div>
      )}
    </>
  );
}

// Course Preview Component
interface CoursePreviewProps {
  courseData: {
    title: string;
    introduction: string;
    objective: string;
    content?: JsonValue;
    resources: ResourceFormData[];
    quiz?: QuizFormData;
  };
}

function CoursePreview({ courseData }: CoursePreviewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerToggle = (optionIndex: number) => {
    if (showResults) return; // Don't allow changes after submission

    setSelectedAnswers(prev => {
      if (prev.includes(optionIndex)) {
        return prev.filter(index => index !== optionIndex);
      } else {
        return [...prev, optionIndex];
      }
    });
  };

  const submitQuiz = () => {
    if (!courseData.quiz || selectedAnswers.length === 0) return;
    
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const renderObjective = (objective: string) => {
    // Split by common bullet point indicators and newlines
    const lines = objective
      .split(/[\n•\-\*]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length <= 1) {
      return <p className="text-muted-foreground">{objective}</p>;
    }

    return (
      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    );
  };

  const getQuizScore = () => {
    if (!courseData.quiz || !showResults) return null;
    
    const correctAnswers = courseData.quiz.correctAnswers;
    const isCorrect = selectedAnswers.length === correctAnswers.length && 
                     selectedAnswers.every(answer => correctAnswers.includes(answer));
    
    return {
      isCorrect,
      selectedCount: selectedAnswers.length,
      correctCount: correctAnswers.length
    };
  };

  const quizScore = getQuizScore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <Badge variant="secondary">Cours</Badge>
          </div>
          <CardTitle className="text-2xl">{courseData.title}</CardTitle>
          {courseData.introduction && (
            <p className="text-muted-foreground mt-2">{courseData.introduction}</p>
          )}
        </CardHeader>
      </Card>

      {/* Learning Objective */}
      {courseData.objective && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Objectif d&apos;apprentissage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderObjective(courseData.objective)}
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Contenu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.content ? (
            <TiptapRenderer content={courseData.content} />
          ) : (
            <p className="text-muted-foreground italic">Aucun contenu disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      {courseData.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Ressources ({courseData.resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courseData.resources.map((resource, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{resource.title}</h4>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  )}
                  <Badge variant="outline" className="mt-1">
                    {resource.type}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  Ouvrir
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interactive Quiz */}
      {courseData.quiz && courseData.quiz.question && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Quiz d&apos;évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{courseData.quiz.question}</h4>
              
              <div className="space-y-3">
                {courseData.quiz.options.map((option, index) => {
                  const isSelected = selectedAnswers.includes(index);
                  const isCorrect = courseData.quiz?.correctAnswers.includes(index);
                  const shouldShowCorrect = showResults && isCorrect;
                  const shouldShowIncorrect = showResults && isSelected && !isCorrect;

                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        shouldShowCorrect ? 'border-green-500 bg-green-50' :
                        shouldShowIncorrect ? 'border-red-500 bg-red-50' :
                        isSelected ? 'border-blue-500 bg-blue-50' : 
                        'hover:bg-muted/50'
                      } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => handleAnswerToggle(index)}
                    >
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        shouldShowCorrect ? 'border-green-500 bg-green-500' :
                        shouldShowIncorrect ? 'border-red-500 bg-red-500' :
                        isSelected ? 'border-blue-500 bg-blue-500' : 
                        'border-gray-300'
                      }`}>
                        {isSelected && (
                          shouldShowCorrect ? (
                            <CheckCircle className="h-3 w-3 text-white" />
                          ) : shouldShowIncorrect ? (
                            <XCircle className="h-3 w-3 text-white" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )
                        )}
                        {!isSelected && shouldShowCorrect && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <span className={shouldShowIncorrect ? 'text-red-700' : shouldShowCorrect ? 'text-green-700' : ''}>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Quiz Results */}
              {showResults && quizScore && (
                <div className={`p-4 rounded-lg ${quizScore.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {quizScore.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${quizScore.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {quizScore.isCorrect ? 'Bonne réponse !' : 'Réponse incorrecte'}
                    </span>
                  </div>
                  <p className={`text-sm ${quizScore.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {quizScore.isCorrect 
                      ? 'Félicitations ! Vous avez sélectionné la bonne réponse.'
                      : 'Les bonnes réponses sont marquées en vert ci-dessus.'
                    }
                  </p>
                </div>
              )}

              {/* Quiz Actions */}
              <div className="flex gap-2 pt-2">
                {!showResults ? (
                  <Button 
                    onClick={submitQuiz}
                    disabled={selectedAnswers.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Valider la réponse
                  </Button>
                ) : (
                  <Button 
                    onClick={resetQuiz}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Refaire le quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 