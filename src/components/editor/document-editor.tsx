"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";

type DocumentEditorProps = {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-100 ${
        active
          ? "bg-[rgba(226,75,74,0.08)] text-[#E24B4A]"
          : "text-[#555] hover:bg-white/[0.05] hover:text-[#ddd]"
      } disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#555]`}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-4 w-px shrink-0 bg-[#1A1A1A]" />;
}

function Toolbar({
  editor,
}: {
  editor: ReturnType<typeof useEditor>;
}) {
  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  const iconSize = 13;
  const sw = 1.5;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto border-b border-[#141414] bg-[#050505] px-3 py-1.5 scrollbar-none">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrito"
      >
        <Bold size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italico"
      >
        <Italic size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough size={iconSize} strokeWidth={sw} />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        active={editor.isActive("heading", { level: 1 })}
        title="Titulo 1"
      >
        <Heading1 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        title="Titulo 2"
      >
        <Heading2 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        title="Titulo 3"
      >
        <Heading3 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista"
      >
        <List size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="Checklist"
      >
        <CheckSquare size={iconSize} strokeWidth={sw} />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Codigo"
      >
        <Code2 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Citacao"
      >
        <Quote size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon size={iconSize} strokeWidth={sw} />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer"
      >
        <Undo2 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer"
      >
        <Redo2 size={iconSize} strokeWidth={sw} />
      </ToolbarButton>
    </div>
  );
}

export function DocumentEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Comece a escrever...",
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "valk-code-block",
        },
      }),
      Link.configure({
        openOnClick: !editable,
        HTMLAttributes: {
          class: "valk-link",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "valk-editor-content outline-none",
      },
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`valk-editor flex flex-col overflow-hidden ${editable ? "rounded-xl border border-[#1A1A1A]" : ""}`}>
      {editable && mounted && <Toolbar editor={editor} />}
      <div className={editable ? "min-h-[200px] px-5 py-4" : "px-0 py-2"}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .valk-editor-content {
          font-family: var(--font-sans), sans-serif;
          font-size: 14px;
          color: #ddd;
          line-height: 1.7;
        }

        .valk-editor-content > *:first-child {
          margin-top: 0;
        }

        .valk-editor-content p {
          margin: 0.5em 0;
        }

        .valk-editor-content h1 {
          font-family: var(--font-display), sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: #eee;
          margin: 1.2em 0 0.4em;
          line-height: 1.3;
        }

        .valk-editor-content h2 {
          font-family: var(--font-display), sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #eee;
          margin: 1em 0 0.3em;
          line-height: 1.3;
        }

        .valk-editor-content h3 {
          font-family: var(--font-display), sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #eee;
          margin: 0.8em 0 0.3em;
          line-height: 1.4;
        }

        .valk-editor-content .valk-code-block {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          background: #050505;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          padding: 16px;
          margin: 0.8em 0;
          color: #bbb;
          overflow-x: auto;
        }

        .valk-editor-content code {
          font-family: var(--font-mono), monospace;
          font-size: 0.9em;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          padding: 1px 5px;
          color: #E24B4A;
        }

        .valk-editor-content .valk-code-block code {
          background: none;
          border: none;
          border-radius: 0;
          padding: 0;
          color: inherit;
        }

        .valk-editor-content .valk-link {
          color: #E24B4A;
          text-decoration: none;
          transition: text-decoration 0.15s;
        }

        .valk-editor-content .valk-link:hover {
          text-decoration: underline;
        }

        .valk-editor-content ul {
          list-style: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .valk-editor-content ul li::marker {
          color: #444;
        }

        .valk-editor-content ol {
          list-style: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .valk-editor-content ol li::marker {
          color: #555;
        }

        .valk-editor-content li {
          margin: 0.15em 0;
        }

        .valk-editor-content ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }

        .valk-editor-content ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 0.25em 0;
        }

        .valk-editor-content ul[data-type="taskList"] li > label {
          margin-top: 3px;
        }

        .valk-editor-content ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          width: 14px;
          height: 14px;
          border: 1.5px solid #333;
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: all 0.15s;
        }

        .valk-editor-content ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background: #E24B4A;
          border-color: #E24B4A;
        }

        .valk-editor-content ul[data-type="taskList"] li > label input[type="checkbox"]:checked::after {
          content: "";
          position: absolute;
          left: 3.5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 1.5px 1.5px 0;
          transform: rotate(45deg);
        }

        .valk-editor-content ul[data-type="taskList"] li[data-checked="true"] > div > p {
          text-decoration: line-through;
          color: #555;
        }

        .valk-editor-content blockquote {
          border-left: 3px solid #E24B4A;
          padding-left: 16px;
          margin: 0.8em 0;
          color: #888;
          font-style: italic;
        }

        .valk-editor-content hr {
          border: none;
          border-top: 1px solid #1a1a1a;
          margin: 1.5em 0;
        }

        .valk-editor-content strong {
          font-weight: 600;
          color: #eee;
        }

        .valk-editor-content em {
          font-style: italic;
        }

        .valk-editor-content s {
          text-decoration: line-through;
          color: #666;
        }

        .valk-editor-content mark {
          background: rgba(226, 75, 74, 0.15);
          color: #eee;
          padding: 1px 3px;
          border-radius: 2px;
        }

        .valk-editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #333;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
