"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Video,
  FileText,
  Target,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Resource, ResourcesTab } from "@/app/components/courses/ressources-tab";
import { createCourse } from "@/app/actions/courses/actions";

// Template for a new course
const newCourseTemplate = {
  title: "",
  introduction: "",
  objective: "",
  videoTitle: "",
  videoUrl: "",
  sections: [
    {
      id: "section1",
      title: "",
      content: "",
    },
  ],
  quiz: {
    question: "",
    options: ["", "", ""],
    correctAnswers: [],
  },
  conclusion: "",
  resources: [],
};

// Define the structure for the course state
interface CourseState {
  title: string;
  introduction: string;
  objective: string;
  videoTitle: string;
  videoUrl: string;
  sections: { id: string; title: string; content: string }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswers: number[];
  };
  conclusion: string;
  resources: Resource[]; // Define a proper type for resources if available
}

export default function NewCoursePage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.formationId as string;
  const moduleId = params.moduleId as string;
  const [course, setCourse] = useState<CourseState>(newCourseTemplate); // Use the defined type
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);

  // Handler functions for updating course content
  const updateCourseField = (field: string, value: string) => {
    setCourse({
      ...course,
      [field]: value,
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updatedSections = [...course.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setCourse({
      ...course,
      sections: updatedSections,
    });
  };

  const addSection = () => {
    setCourse({
      ...course,
      sections: [
        ...course.sections,
        {
          id: `section${course.sections.length + 1}`,
          title: "",
          content: "",
        },
      ],
    });
  };

  const addQuizOption = () => {
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        options: [...course.quiz.options, ""],
      },
    });
  };

  const updateQuizOption = (index: number, value: string) => {
    const newOptions = [...course.quiz.options];
    newOptions[index] = value;
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        options: newOptions,
      },
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    const correctAnswers = new Set(course.quiz.correctAnswers);
    if (correctAnswers.has(index as never)) {
      correctAnswers.delete(index as never);
    } else {
      correctAnswers.add(index as never);
    }
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        correctAnswers: Array.from(correctAnswers),
      },
    });
  };

  // Renamed function to handle the create action directly
  const handleCreateCourse = async () => {
    try {
      setIsLoading(true);
      // Call the server action to create the course
      const result = await createCourse({
        title: course.title, // Use state data
        introduction: course.introduction, // Use state data
        objective: course.objective, // Use state data
        videoTitle: course.videoTitle, // Use state data
        videoUrl: course.videoUrl, // Use state data
        moduleId: moduleId, // Pass the module ID from params
      });

      if (result.success && result.data) {
        // Redirect to the edit page for the newly created course
        router.push(`/dashboard/formations/${formationId}/modules/${moduleId}/courses/${result.data.id}/edit`);
        // Optionally show a success toast here
      } else {
        // Handle error, maybe show an error toast
        console.error("Error creating course:", result.error);
        // Show error toast
      }
    } catch (error) {
      console.error("Create course error:", error);
      // Show generic error toast
    } finally {
      setIsLoading(false);
    }
  };

  const isBasicInfoComplete = () => {
    return course.title && course.introduction && course.objective;
  };

  const isContentComplete = () => {
    return course.sections.every((section) => section.title && section.content);
  };

  const isQuizComplete = () => {
    return (
      course.quiz.question &&
      course.quiz.options.length >= 2 &&
      course.quiz.options.every((option) => option) &&
      course.quiz.correctAnswers.length > 0
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Créer un nouveau cours</h1>
            <p className="text-muted-foreground mt-1">
              Ajoutez du contenu, des quiz et des ressources pour votre nouveau cours
            </p>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="basic"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Info de base</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="course-title"
                    className="text-base font-semibold"
                  >
                    Titre du cours
                  </Label>
                  <Input
                    id="course-title"
                    placeholder="Entrez le titre du cours"
                    value={course.title}
                    onChange={(e) => updateCourseField("title", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="course-introduction"
                    className="text-base font-semibold"
                  >
                    Introduction
                  </Label>
                  <Textarea
                    id="course-introduction"
                    placeholder="Écrivez une introduction concise pour votre cours"
                    value={course.introduction}
                    onChange={(e) =>
                      updateCourseField("introduction", e.target.value)
                    }
                    rows={4}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objectif du cours
                  </Label>
                  <Textarea
                    placeholder="Qu'apprendront les étudiants de ce cours?"
                    value={course.objective}
                    onChange={(e) =>
                      updateCourseField("objective", e.target.value)
                    }
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setActiveTab("content")}
              disabled={!isBasicInfoComplete()}
            >
              Continuer au contenu <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Video Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Video className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-semibold">
                  Contenu vidéo (Optionnel)
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-title">Titre de la vidéo</Label>
                  <Input
                    id="video-title"
                    placeholder="Entrez le titre de la vidéo"
                    value={course.videoTitle}
                    onChange={(e) =>
                      updateCourseField("videoTitle", e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="video-url">URL de la vidéo</Label>
                  <Input
                    id="video-url"
                    placeholder="Entrez l'URL de la vidéo"
                    value={course.videoUrl}
                    onChange={(e) =>
                      updateCourseField("videoUrl", e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-4">
            {course.sections.map((section, index) => (
              <Card key={section.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold">
                      Section {index + 1}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`section-${index}-title`}>
                        Titre de la section
                      </Label>
                      <Input
                        id={`section-${index}-title`}
                        placeholder="Entrez le titre de la section"
                        value={section.title}
                        onChange={(e) =>
                          updateSection(index, "title", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`section-${index}-content`}>
                        Contenu
                      </Label>
                      <Textarea
                        id={`section-${index}-content`}
                        placeholder="Écrivez le contenu de la section ici..."
                        value={section.content}
                        onChange={(e) =>
                          updateSection(index, "content", e.target.value)
                        }
                        rows={6}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full py-6"
              onClick={addSection}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une nouvelle section
            </Button>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("basic")}>
              <ArrowLeft className="h-4 w-4" /> Retour à l&apos;info de base
            </Button>
            <Button
              onClick={() => setActiveTab("quiz")}
              disabled={!isContentComplete()}
            >
              Continuer au quiz <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-semibold">Quiz</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="quiz-question">Question</Label>
                  <Textarea
                    id="quiz-question"
                    placeholder="Enter your quiz question"
                    value={course.quiz.question}
                    onChange={(e) =>
                      setCourse({
                        ...course,
                        quiz: { ...course.quiz, question: e.target.value },
                      })
                    }
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Options</Label>
                  {course.quiz.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateQuizOption(index, e.target.value)
                        }
                      />
                      <Select
                        value={
                          course.quiz.correctAnswers.includes(index as never)
                            ? "correct"
                            : "incorrect"
                        }
                        onValueChange={() =>
                          toggleCorrectAnswer(index as never)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="correct">Correct</SelectItem>
                          <SelectItem value="incorrect">Incorrect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={addQuizOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une option
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("content")}>
              <ArrowLeft className="h-4 w-4" /> Retour au contenu
            </Button>
            <Button
              onClick={() => setActiveTab("resources")}
              disabled={!isQuizComplete()}
            >
              Continuer aux ressources <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <ResourcesTab 
            resources={course.resources as Resource[]}
            onResourcesChange={(newResources) => 
              setCourse({ ...course, resources: newResources as never[] })
            }
          />
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setActiveTab("quiz")}
            >
              <ArrowLeft className="h-4 w-4" /> Retour au quiz
            </Button>
            <Button variant="tabNav" onClick={() => setActiveTab("preview")}>
              Aperçu <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <h1>{course.title}</h1>
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Objectif</h3>
                  <p>{course.objective}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                  <p>{course.introduction}</p>
                </div>

                {course.videoTitle && course.videoUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Contenu vidéo
                    </h3>
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <p>{course.videoTitle}</p>
                      <p className="text-sm text-slate-500">
                        {course.videoUrl}
                      </p>
                    </div>
                  </div>
                )}

                {course.sections.map((section) => (
                  <div key={section.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {section.title}
                    </h3>
                    <p>{section.content}</p>
                  </div>
                ))}

                <div className="bg-slate-50 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Quiz</h3>
                  <p className="mb-4">{course.quiz.question}</p>
                  <ul className="list-none pl-0">
                    {course.quiz.options.map((option, index) => (
                      <li
                        key={index}
                        className={`p-2 rounded-lg mb-2 ${
                          course.quiz.correctAnswers.includes(index as never)
                            ? "bg-green-50 border border-green-200"
                            : "bg-white border"
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("resources")}>
              Retour aux ressources
            </Button>
            <Button
              type="button" // Changed to button type
              disabled={isLoading}
              onClick={handleCreateCourse} // Call the new handler
            >
              {isLoading ? "Création en cours..." : "Créer le cours"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
