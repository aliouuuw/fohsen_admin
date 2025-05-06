"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Video,
  FileText,
  Target,
  Activity,
  Save,
  Trash,
  ArrowRight,
  LinkIcon,
  ImageIcon,
  File,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourcesTab } from "@/components/courses/ressources-tab";

interface Course {
  id: string;
  title: string;
  introduction: string;
  objective: string;
  videoTitle: string;
  videoUrl: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswers: number[];
  };
  resources: {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'link' | 'image';
    url: string;
  }[];
}

// Mock data - replace with actual data fetching
const mockCourse: Course = {
  id: "1",
  title: "Cours 1: Prise en charge intégrée des maladies de l'enfant",
  introduction:
    "La Prise en Charge Intégrée des Maladies de l'Enfant (PCIME) est une approche qui vise à améliorer la santé des enfants de moins de 5 ans. Dans ce module, nous explorerons les différentes stratégies pour identifier, évaluer et traiter les maladies infantiles courantes.",
  objective:
    "Vous donner les connaissances et outils nécessaires pour identifier et prendre en charge efficacement les maladies courantes chez les enfants.",
  videoTitle: "Vidéo: Identification des signes de danger",
  videoUrl: "https://example.com/video.mp4",
  sections: [
    {
      id: "section1",
      title: "Pourquoi la PCIME est-elle importante ?",
      content:
        "Dans beaucoup de villages, les enfants de moins de 5 ans sont particulièrement vulnérables aux maladies. La PCIME permet une approche systématique pour identifier et traiter ces problèmes de santé avant qu'ils ne deviennent graves.",
    },
    {
      id: "section2",
      title: "Quels sont les signes de danger ?",
      content:
        "• L'enfant ne peut pas boire ou téter\n• L'enfant vomit tout ce qu'il consomme\n• L'enfant a des convulsions\n• L'enfant est léthargique ou inconscient",
    },
  ],
  quiz: {
    question:
      "Mariam amène son fils de 2 ans qui a de la fièvre. Quels signes devez-vous rechercher en priorité ?",
    options: [
      "La couleur de la peau",
      "Capacité à boire ou téter",
      "S'il a pleuré aujourd'hui",
      "Présence de vomissements",
    ],
    correctAnswers: [1, 3],
  },
  resources: [],
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState(mockCourse);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const preview = searchParams.get("preview");
    if (preview === "true") {
      setActiveTab("preview");
    }
  }, [searchParams]);

  // Handler functions
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

  const removeSection = (index: number) => {
    const updatedSections = [...course.sections];
    updatedSections.splice(index, 1);
    setCourse({
      ...course,
      sections: updatedSections,
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

  const removeQuizOption = (index: number) => {
    const newOptions = [...course.quiz.options];
    newOptions.splice(index, 1);
    const newCorrectAnswers = course.quiz.correctAnswers
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));

    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        options: newOptions,
        correctAnswers: newCorrectAnswers,
      },
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    const correctAnswers = new Set(course.quiz.correctAnswers);
    if (correctAnswers.has(index)) {
      correctAnswers.delete(index);
    } else {
      correctAnswers.add(index);
    }
    setCourse({
      ...course,
      quiz: {
        ...course.quiz,
        correctAnswers: Array.from(correctAnswers),
      },
    });
  };

  const handleSave = async () => {
    // Save logic here
    console.log("Saving course:", course);
    router.push(
      `/dashboard/formations/${params.formationId}/modules/${params.moduleId}/courses`
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
            onClick={() =>
              router.push(
                `/dashboard/formations/${params.formationId}/modules/${params.moduleId}/courses`
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground mt-1">
              Mettre à jour le contenu du cours, les quiz et les ressources
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          if (value !== "preview") {
            router.push(
              `/dashboard/formations/${params.formationId}/modules/${params.moduleId}/courses/${params.courseId}/edit?preview=false`
            );
          }
          if (value === "preview") {
            router.push(
              `/dashboard/formations/${params.formationId}/modules/${params.moduleId}/courses/${params.courseId}/edit?preview=true`
            );
          }
        }}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Informations de base</TabsTrigger>
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
            <Button variant="tabNav" onClick={() => setActiveTab("content")}>
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
                <h3 className="text-lg font-semibold">Contenu vidéo</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-title">Titre de la vidéo</Label>
                  <Input
                    id="video-title"
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      <h3 className="text-lg font-semibold">
                        Section {index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`section-${index}-title`}>
                        Section Title
                      </Label>
                      <Input
                        id={`section-${index}-title`}
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
            <Button variant="tabNav" onClick={() => setActiveTab("basic")}>
              <ArrowLeft className="h-4 w-4" /> Retour aux informations de base
            </Button>
            <Button variant="tabNav" onClick={() => setActiveTab("quiz")}>
              Continuer au quiz <ArrowRight className="h-4 w-4 ml-2" />
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
                        value={option}
                        onChange={(e) =>
                          updateQuizOption(index, e.target.value)
                        }
                      />
                      <Select
                        value={
                          course.quiz.correctAnswers.includes(index)
                            ? "correct"
                            : "incorrect"
                        }
                        onValueChange={() => toggleCorrectAnswer(index)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="correct">Correct</SelectItem>
                          <SelectItem value="incorrect">Incorrect</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuizOption(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
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
            <Button variant="tabNav" onClick={() => setActiveTab("content")}>
              <ArrowLeft className="h-4 w-4" /> Retour au contenu
            </Button>
            <Button variant="tabNav" onClick={() => setActiveTab("resources")}>
              Continuer aux ressources <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Ressources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <ResourcesTab
            resources={course.resources as never[]}
            onResourcesChange={(newResources) =>
              setCourse({ ...course, resources: newResources as never[] })
            }
          />

          <div className="flex justify-between">
            <Button variant="tabNav" onClick={() => setActiveTab("quiz")}>
              <ArrowLeft className="h-4 w-4" /> Retour au quiz
            </Button>
            <Button variant="tabNav" onClick={() => setActiveTab("preview")}>
              Continuer à l&apos;aperçu <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none space-y-4">
                <h1 className="text-2xl font-bold">{course.title}</h1>
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
                    <p className="whitespace-pre-wrap">{section.content}</p>
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
                          course.quiz.correctAnswers.includes(index)
                            ? "bg-green-50 border border-green-200"
                            : "bg-white border"
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>

                {course.resources.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg mt-6">
                    <h3 className="text-lg font-semibold mb-2">Ressources du cours</h3>
                    <div className="space-y-2">
                      {course.resources.map((resource) => (
                        <div 
                          key={resource.id}
                          className="flex items-center p-2 bg-white rounded border"
                        >
                          {resource.type === 'pdf' ? (
                            <FileText className="h-4 w-4 text-blue-500" />
                          ) : resource.type === 'link' ? (
                            <LinkIcon className="h-4 w-4 text-purple-500" />
                          ) : resource.type === 'image' ? (
                            <ImageIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <File className="h-4 w-4 text-gray-500" />
                          )}
                          <div className="ml-2">
                            <p className="font-medium">{resource.title}</p>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="tabNav" onClick={() => setActiveTab("quiz")}>
              <ArrowLeft className="h-4 w-4" /> Retour au quiz
            </Button>
            <Button onClick={handleSave}>Enregistrer les modifications</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
