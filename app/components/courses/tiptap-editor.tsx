"use client";

import { useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import type { Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Link as LinkIcon, 
  Undo, 
  Redo,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  CheckSquare,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Toggle } from "@/app/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";
import { saveCourseContent } from "@/app/actions/courses/actions";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { JsonValue } from '@prisma/client/runtime/library';

export interface TiptapEditorProps {
  courseId: string;
  initialContent?: JsonValue;
  onSaved?: () => void;
  onContentChange?: (content: JsonValue) => void;
  hideIndividualSaveButton?: boolean;
}

export default function TiptapEditor({
  courseId,
  initialContent = null,
  onSaved,
  onContentChange,
  hideIndividualSaveButton = false,
}: TiptapEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto",
        },
      }),
      Youtube.configure({
        width: 800,
        height: 300,
        controls: true,
        nocookie: false,
        allowFullscreen: true,
        autoplay: false,
        modestBranding: true,
        HTMLAttributes: {
          class: "w-full max-w-3xl aspect-video rounded-md my-4 block mx-auto shadow-lg",
        },
      }),
      Placeholder.configure({
        placeholder: "Entrez le contenu du cours ici...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: getInitialContent(initialContent),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4 min-h-[200px]",
      },
    },
    onUpdate: ({ editor }) => {
      setHasUnsavedChanges(true);
      if (onContentChange && editor) {
        onContentChange(editor.getJSON());
      }
    },
  });

  // Helper function to safely parse initial content
  function getInitialContent(content: JsonValue): Content {
    if (!content) return "";
    
    // If it's already a valid object (TipTap JSON format), return it
    if (typeof content === "object" && content !== null && !Array.isArray(content)) {
      return content as Content;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof content === "string") {
      try {
        return JSON.parse(content) as Content;
      } catch {
        // If parsing fails, treat it as plain text
        return content;
      }
    }
    
    // For any other type, return empty
    return "";
  }

  const handleSave = async () => {
    if (!editor) return;

    try {
      setIsSaving(true);
      const content = JSON.stringify(editor.getJSON());
      const result = await saveCourseContent(Number(courseId), content);

      if (!result.success) {
        throw new Error(result.error || "Failed to save content");
      }

      setHasUnsavedChanges(false);
      toast.success("Contenu sauvegardé avec succès");
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving course content:", error);
      toast.error("Erreur lors de la sauvegarde du contenu");
    } finally {
      setIsSaving(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('URL de l\'image');
    if (url) {
      try {
        editor?.chain().focus().setImage({ src: url }).run();
        toast.success("Image ajoutée avec succès");
      } catch (error) {
        console.error("Error adding image:", error);
        toast.error("Erreur lors de l'ajout de l'image");
      }
    }
  };

  const addYouTube = () => {
    const url = window.prompt('URL de la vidéo YouTube');
    if (url) {
      try {
        // Validate YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(url)) {
          toast.error("Veuillez entrer une URL YouTube valide");
          return;
        }
        
        editor?.chain().focus().setYoutubeVideo({
          src: url,
          width: 800,
          height: 300,
        }).run();
        toast.success("Vidéo YouTube ajoutée avec succès");
      } catch (error) {
        console.error("Error adding YouTube video:", error);
        toast.error("Erreur lors de l'ajout de la vidéo YouTube");
      }
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL du lien', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    try {
      // empty
      if (url === '') {
        editor?.chain().focus().extendMarkRange('link').unsetLink().run();
        toast.success("Lien supprimé");
        return;
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        toast.error("Veuillez entrer une URL valide");
        return;
      }

      // update link
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      toast.success("Lien ajouté avec succès");
    } catch (error) {
      console.error("Error setting link:", error);
      toast.error("Erreur lors de l'ajout du lien");
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Card className="course-editor">
      <CardContent className="p-4">
        {/* Enhanced Editor Toolbar */}
        <div className="editor-toolbar border rounded-t-lg bg-muted p-3 flex flex-wrap gap-1 items-center">
          {/* History */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={false}
                    onPressedChange={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                  >
                    <Undo className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Annuler</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={false}
                    onPressedChange={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                  >
                    <Redo className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Refaire</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Text Style */}
          <div className="flex gap-1">
            <Select
              value={
                editor.isActive('heading', { level: 1 }) ? 'h1' :
                editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' :
                'paragraph'
              }
              onValueChange={(value) => {
                if (value === 'paragraph') {
                  editor.chain().focus().setParagraph().run();
                } else if (value === 'h1') {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                } else if (value === 'h2') {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                } else if (value === 'h3') {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                }
              }}
            >
              <SelectTrigger className="w-32 h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraphe</SelectItem>
                <SelectItem value="h1">Titre 1</SelectItem>
                <SelectItem value="h2">Titre 2</SelectItem>
                <SelectItem value="h3">Titre 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Text Formatting */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Gras</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Italique</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Souligné</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('strike')}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Barré</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('code')}
                    onPressedChange={() => editor.chain().focus().toggleCode().run()}
                  >
                    <Code className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Script */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('subscript')}
                    onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
                  >
                    <SubscriptIcon className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Indice</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('superscript')}
                    onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
                  >
                    <SuperscriptIcon className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Exposant</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Alignment */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'left' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Aligner à gauche</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'center' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Centrer</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'right' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Aligner à droite</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'justify' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Justifier</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Lists */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    <List className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Liste à puces</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Liste numérotée</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('taskList')}
                    onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
                  >
                    <CheckSquare className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Liste de tâches</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Block Elements */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <Quote className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Citation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    <Separator className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ligne de séparation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Media */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajouter une image</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addYouTube}
                  >
                    <YoutubeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajouter une vidéo YouTube</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={setLink}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajouter un lien</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Editor Content */}
        <div className="editor-container rounded-b-lg border border-t-0">
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>

        {/* Enhanced Bubble Menu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden flex border"
          >
            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("bold") ? "bg-muted" : ""}`}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("italic") ? "bg-muted" : ""}`}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("underline") ? "bg-muted" : ""}`}
              title="Souligné"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("strike") ? "bg-muted" : ""}`}
              title="Barré"
            >
              <Strikethrough className="h-4 w-4" />
            </button>

            <div className="w-px bg-border" />

            {/* Headings */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}`}
              title="Titre 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}`}
              title="Titre 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}`}
              title="Titre 3"
            >
              <Heading3 className="h-4 w-4" />
            </button>

            <div className="w-px bg-border" />

            {/* Link */}
            <button
              type="button"
              onClick={setLink}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("link") ? "bg-muted" : ""}`}
              title="Lien"
            >
              <LinkIcon className="h-4 w-4" />
            </button>

            {/* Code */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 hover:bg-muted transition-colors ${editor.isActive("code") ? "bg-muted" : ""}`}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </button>
          </BubbleMenu>
        )}

        {/* Save Button */}
        {!hideIndividualSaveButton && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges && !isSaving && (
                <span className="text-amber-600">• Modifications non sauvegardées</span>
              )}
              {isSaving && (
                <span className="text-blue-600">• Sauvegarde en cours...</span>
              )}
              {!hasUnsavedChanges && !isSaving && (
                <span className="text-green-600">• Contenu sauvegardé</span>
              )}
            </div>
            <Button
              type="button"
              className="bg-primary text-white"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? "Sauvegarde..." : "Sauvegarder le contenu"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
