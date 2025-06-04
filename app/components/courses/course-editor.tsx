"use client";

import { useEffect, useState, useContext, createContext } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getRoot, $createParagraphNode, LexicalEditor, EditorState, FORMAT_TEXT_COMMAND, $createTextNode } from "lexical";
import { Button } from "@/app/components/ui/button";
import { UploadButton } from "@uploadthing/react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading, 
  Quote, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileVideo, 
  FileUp, 
} from "lucide-react";
import { Toggle } from "@/app/components/ui/toggle";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Card, CardContent } from "@/app/components/ui/card";
import { saveCourseContent } from "@/app/actions/courses/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { CodeNode } from "@lexical/code";
import { CodeHighlightNode } from "@lexical/code";

// Custom nodes for our editor
const nodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
];

interface CourseEditorProps {
  courseId: string;
  initialContent?: string;
}

// Create a new component to handle editor initialization
function EditorSetup() {
  const [editor] = useLexicalComposerContext();
  const editorContext = useContext(EditorContext);
  
  useEffect(() => {
    editorContext.setEditor(editor);
  }, [editor, editorContext]);
  
  return null;
}

// Create a context to share editor instance
const EditorContext = createContext<{
  editor: LexicalEditor | null;
  setEditor: (editor: LexicalEditor | null) => void;
}>({ editor: null, setEditor: () => {} });

export default function CourseEditor({ courseId, initialContent = "" }: CourseEditorProps) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  
  const initialConfig = {
    namespace: "course-editor",
    theme: {
      root: "h-full min-h-[300px] px-4 py-2 bg-white focus:outline-none rounded-lg border border-input",
      link: "cursor-pointer text-blue-500 underline",
      heading: {
        h1: "text-2xl font-bold py-2",
        h2: "text-xl font-bold py-2",
        h3: "text-lg font-bold py-2",
      },
      quote: "border-l-4 border-gray-300 pl-4 py-2 my-2",
      list: {
        ol: "list-decimal pl-5 py-2",
        ul: "list-disc pl-5 py-2",
      },
    },
    nodes,
    onError: (error: Error) => console.error(error),
  };

  useEffect(() => {
    if (editor && initialContent) {
      try {
        const emptyState = editor.getEditorState();
        editor.setEditorState(emptyState);
        
        if (initialContent && initialContent.trim() !== '') {
          const parsedContent = JSON.parse(initialContent);
          if (parsedContent && typeof parsedContent === 'object' && parsedContent.root) {
            const state = editor.parseEditorState(parsedContent);
            editor.setEditorState(state);
          }
        }
      } catch (e) {
        console.error("Error loading initial content:", e);
        const emptyState = editor.getEditorState();
        editor.setEditorState(emptyState);
      }
    }
  }, [editor, initialContent]);

  const onChange = (state: EditorState) => {
    setEditorState(state);
  };

  const executeCommand = (command: string) => {
    if (!editor) return;
    
    editor.update(() => {
      switch (command) {
        case "bold":
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          break;
        case "italic":
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          break;
        case "ul":
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case "ol":
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
        default:
          break;
      }
    });
  };

  const insertMedia = (url: string, type: "image" | "video" | "file") => {
    if (!editor) return;
    
    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      
      if (type === "image") {
        paragraph.append($createTextNode(`![Course image](${url})`));
      } else if (type === "video") {
        paragraph.append($createTextNode(`<video controls src="${url}"></video>`));
      } else if (type === "file") {
        const fileName = url.split("/").pop() || "Download file";
        paragraph.append($createTextNode(`[${fileName}](${url})`));
      }
      
      root.append(paragraph);
    });
  };

  const handleSave = async () => {
    if (!editorState) return;
    
    try {
      setIsSaving(true);
      const serializedState = JSON.stringify(editorState.toJSON());
      const result = await saveCourseContent(Number(courseId), serializedState);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      <Card className="course-editor">
        <CardContent className="p-4">
          <LexicalComposer initialConfig={initialConfig}>
            <EditorSetup />
            <div className="editor-toolbar border rounded-t-lg bg-muted p-2 flex flex-wrap gap-1 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("bold")}>
                      <Bold className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("italic")}>
                      <Italic className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("heading")}>
                      <Heading className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Heading</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("quote")}>
                      <Quote className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="h-6 w-px bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("ul")}>
                      <List className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("ol")}>
                      <ListOrdered className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Numbered List</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle onClick={() => executeCommand("link")}>
                      <LinkIcon className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="h-6 w-px bg-border mx-1" />

              <UploadButton<OurFileRouter, "courseImage">
                endpoint="courseImage"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    insertMedia(res[0].url, "image");
                  }
                }}
                className="ut-button:bg-transparent ut-button:text-foreground ut-button:border-0 ut-button:shadow-none ut-button:p-0"
                content={{
                  button({ ready }) {
                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Toggle className={!ready ? "opacity-50" : ""}>
                              <ImageIcon className="h-4 w-4" />
                            </Toggle>
                          </TooltipTrigger>
                          <TooltipContent>Télécharger une image</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  },
                  allowedContent({ ready, fileTypes, isUploading }) {
                    if (!ready) return "Vérification...";
                    if (isUploading) return "Téléchargement...";
                    return `${fileTypes.join(", ")}`;
                  },
                }}
              />

              <UploadButton<OurFileRouter, "courseVideo">
                endpoint="courseVideo"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    insertMedia(res[0].url, "video");
                  }
                }}
                className="ut-button:bg-transparent ut-button:text-foreground ut-button:border-0 ut-button:shadow-none ut-button:p-0"
                content={{
                  button({ ready }) {
                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Toggle className={!ready ? "opacity-50" : ""}>
                              <FileVideo className="h-4 w-4" />
                            </Toggle>
                          </TooltipTrigger>
                          <TooltipContent>Télécharger une vidéo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  },
                  allowedContent({ ready, fileTypes, isUploading }) {
                    if (!ready) return "Vérification...";
                    if (isUploading) return "Téléchargement...";
                    return `${fileTypes.join(", ")}`;
                  },
                }}
              />

              <UploadButton<OurFileRouter, "courseAttachment">
                endpoint="courseAttachment"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    insertMedia(res[0].url, "file");
                  }
                }}
                className="ut-button:bg-transparent ut-button:text-foreground ut-button:border-0 ut-button:shadow-none ut-button:p-0"
                content={{
                  button({ ready }) {
                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Toggle className={!ready ? "opacity-50" : ""}>
                              <FileUp className="h-4 w-4" />
                            </Toggle>
                          </TooltipTrigger>
                          <TooltipContent>Télécharger un fichier</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  },
                  allowedContent({ ready, fileTypes, isUploading }) {
                    if (!ready) return "Vérification...";
                    if (isUploading) return "Téléchargement...";
                    return `${fileTypes.join(", ")}`;
                  },
                }}
              />
            </div>
            
            <div className="editor-container rounded-b-lg border border-t-0">
              <RichTextPlugin
                contentEditable={<ContentEditable className="outline-none min-h-[200px] p-4" />}
                placeholder={<div className="absolute top-[76px] left-[20px] pointer-events-none text-muted-foreground">Enter course content here...</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <AutoFocusPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <OnChangePlugin onChange={onChange} />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-primary text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Content"}
              </Button>
            </div>
          </LexicalComposer>
        </CardContent>
      </Card>
    </EditorContext.Provider>
  );
}