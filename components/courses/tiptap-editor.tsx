"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Bold, Italic, Link as LinkIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { saveCourseContent } from "@/app/actions/courses/actions";

interface TiptapEditorProps {
  courseId: string;
  initialContent?: string;
  onSaved?: () => void;
}

export default function TiptapEditor({
  courseId,
  initialContent = "",
  onSaved,
}: TiptapEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit,
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
        HTMLAttributes: {
          class: "w-full aspect-video rounded-md",
        },
      }),
      Placeholder.configure({
        placeholder: "Enter course content here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialContent ? JSON.parse(initialContent) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4 min-h-[200px]",
      },
    },
  });

  useEffect(() => {
    if (
      editor &&
      initialContent &&
      initialContent !== "{}" &&
      initialContent !== '""'
    ) {
      // Don't parse again, the editor is already initialized with the parsed content
      // Only set content if you need to update it after initialization
    }
  }, [editor, initialContent]);

  const handleSave = async () => {
    if (!editor) return;

    try {
      setIsSaving(true);
      const content = JSON.stringify(editor.getJSON());
      const result = await saveCourseContent(Number(courseId), content);

      if (!result.success) {
        throw new Error(result.error || "Failed to save content");
      }

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving course content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Card className="course-editor">
      <CardContent className="p-4">
        {/* Editor Toolbar */}
        <div className="editor-toolbar border rounded-t-lg bg-muted p-2 flex flex-wrap gap-1 items-center">
          {/* Undo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  onPressedChange={() => editor.chain().focus().undo().run()}
                >
                  <Undo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Redo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  onPressedChange={() => editor.chain().focus().redo().run()}
                >
                  <Redo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Editor Content */}
        <div className="editor-container rounded-b-lg border border-t-0">
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>

        {/* Bubble Menu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-white shadow-md rounded-md overflow-hidden flex border"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 ${editor.isActive("bold") ? "bg-muted" : ""}`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 ${editor.isActive("italic") ? "bg-muted" : ""}`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const url = window.prompt("URL");
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={`p-2 ${editor.isActive("link") ? "bg-muted" : ""}`}
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </BubbleMenu>
        )}

        {/* Save Button */}
        <div className="mt-4 flex justify-end">
          <Button
            className="bg-primary text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Content"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
