"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import type { Content } from "@tiptap/react";
import { JsonValue } from '@prisma/client/runtime/library';

interface TiptapRendererProps {
  content: JsonValue;
  className?: string;
}

export default function TiptapRenderer({ content, className = "" }: TiptapRendererProps) {
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
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer hover:text-blue-700",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto my-6 block mx-auto shadow-lg",
        },
      }),
      Youtube.configure({
        width: 800,
        height: 450,
        controls: true,
        nocookie: false,
        allowFullscreen: true,
        autoplay: false,
        modestBranding: true,
        HTMLAttributes: {
          class: "w-full max-w-4xl aspect-video rounded-md my-6 block mx-auto shadow-lg",
        },
      }),
    ],
    content: getContentForDisplay(content),
    editable: false,
    editorProps: {
      attributes: {
        class: `tiptap-renderer max-w-none focus:outline-none ${className}`,
        style: 'line-height: 1.7;',
      },
    },
  });

  function getContentForDisplay(content: JsonValue): Content {
    if (!content) return "";
    
    // If it's already a valid object (TipTap JSON format), return it
    if (typeof content === "object" && content !== null && !Array.isArray(content)) {
      return content as Content;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content) as Content;
        return parsed;
      } catch {
        // If parsing fails, treat it as plain text
        return content;
      }
    }
    
    // For any other type, return empty
    return "";
  }

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div 
      className="tiptap-content prose max-w-none"
      style={{
        // Custom styles for proper content rendering
        '--tw-prose-body': 'rgb(55 65 81)',
        '--tw-prose-headings': 'rgb(17 24 39)',
        '--tw-prose-lead': 'rgb(75 85 99)',
        '--tw-prose-links': 'rgb(59 130 246)',
        '--tw-prose-bold': 'rgb(17 24 39)',
        '--tw-prose-counters': 'rgb(75 85 99)',
        '--tw-prose-bullets': 'rgb(156 163 175)',
        '--tw-prose-hr': 'rgb(229 231 235)',
        '--tw-prose-quotes': 'rgb(17 24 39)',
        '--tw-prose-quote-borders': 'rgb(229 231 235)',
        '--tw-prose-captions': 'rgb(75 85 99)',
        '--tw-prose-code': 'rgb(17 24 39)',
        '--tw-prose-pre-code': 'rgb(229 231 235)',
        '--tw-prose-pre-bg': 'rgb(17 24 39)',
        '--tw-prose-th-borders': 'rgb(209 213 219)',
        '--tw-prose-td-borders': 'rgb(229 231 235)',
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .tiptap-content .ProseMirror {
            outline: none;
          }
          
          .tiptap-content .ProseMirror p {
            margin-bottom: 1rem;
          }
          
          .tiptap-content .ProseMirror h1,
          .tiptap-content .ProseMirror h2,
          .tiptap-content .ProseMirror h3,
          .tiptap-content .ProseMirror h4,
          .tiptap-content .ProseMirror h5,
          .tiptap-content .ProseMirror h6 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
            line-height: 1.25;
          }
          
          .tiptap-content .ProseMirror h1 {
            font-size: 2rem;
          }
          
          .tiptap-content .ProseMirror h2 {
            font-size: 1.75rem;
          }
          
          .tiptap-content .ProseMirror h3 {
            font-size: 1.5rem;
          }
          
          .tiptap-content .ProseMirror ul,
          .tiptap-content .ProseMirror ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }
          
          .tiptap-content .ProseMirror li {
            margin-bottom: 0.25rem;
          }
          
          .tiptap-content .ProseMirror blockquote {
            border-left: 4px solid rgb(229 231 235);
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: rgb(107 114 128);
          }
          
          .tiptap-content .ProseMirror img {
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
            height: auto !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          
          .tiptap-content .ProseMirror iframe {
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          
          .tiptap-content .ProseMirror [data-youtube-video] {
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          
          .tiptap-content .ProseMirror [data-youtube-video] iframe,
          .tiptap-content .ProseMirror iframe[src*="youtube.com"],
          .tiptap-content .ProseMirror iframe[src*="youtube-nocookie.com"] {
            width: 100% !important;
            max-height: 300px !important;
            min-height: 200px !important;
            aspect-ratio: 16/9 !important;
            border: none !important;
            border-radius: 0.5rem !important;
          }
          
          .tiptap-content .ProseMirror .youtube-video,
          .tiptap-content .ProseMirror [data-type="youtube"] {
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          
          .tiptap-content .ProseMirror .youtube-video iframe,
          .tiptap-content .ProseMirror [data-type="youtube"] iframe {
            width: 100% !important;
            max-height: 300px !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          
          .tiptap-content .ProseMirror hr {
            margin: 2rem 0 !important;
            border: none !important;
            border-top: 1px solid rgb(229 231 235) !important;
          }
          
          .tiptap-content .ProseMirror code {
            background-color: rgb(243 244 246) !important;
            padding: 0.25rem 0.5rem !important;
            border-radius: 0.25rem !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
            font-size: 0.875em !important;
          }
          
          .tiptap-content .ProseMirror pre {
            background-color: rgb(243 244 246) !important;
            padding: 1rem !important;
            border-radius: 0.5rem !important;
            overflow-x: auto !important;
            margin: 1rem 0 !important;
          }
          
          .tiptap-content .ProseMirror ul[data-type="taskList"] {
            list-style: none !important;
            padding-left: 0 !important;
          }
          
          .tiptap-content .ProseMirror li[data-type="taskItem"] {
            display: flex !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          .tiptap-content .ProseMirror li[data-type="taskItem"] input[type="checkbox"] {
            margin: 0 !important;
            margin-top: 0.125rem !important;
          }
        `
      }} />
      <EditorContent editor={editor} />
    </div>
  );
} 