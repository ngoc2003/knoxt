import { useEffect, useRef } from "react";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import {
  Bold,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Undo2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

export function RichTextEditor({
  content,
  onChange,
  editable = true,
}: {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}) {
  const lastEmittedContent = useRef(content);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit,
      Markdown.configure({
        markedOptions: { gfm: true },
      }),
    ],
    content,
    contentType: "markdown",
    editable,
    editorProps: {
      attributes: {
        class: "min-h-full px-8 py-6 outline-none",
        "aria-label": "Rich text note content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = currentEditor.getMarkdown();
      lastEmittedContent.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor || content === lastEmittedContent.current) return;
    editor.commands.setContent(content, {
      contentType: "markdown",
      emitUpdate: false,
    });
    lastEmittedContent.current = content;
  }, [content, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      strike: currentEditor?.isActive("strike") ?? false,
      heading1: currentEditor?.isActive("heading", { level: 1 }) ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      taskList: currentEditor?.isActive("taskList") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      codeBlock: currentEditor?.isActive("codeBlock") ?? false,
      link: currentEditor?.isActive("link") ?? false,
    }),
  });

  if (!editor) return null;

  const setLink = () => {
    const currentUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", currentUrl ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const toolbarButtons = [
    {
      label: "Heading 1",
      icon: Heading1,
      active: state?.heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      active: state?.heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bold",
      icon: Bold,
      active: state?.bold,
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state?.italic,
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state?.strike,
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    { label: "Link", icon: Link2, active: state?.link, action: setLink },
    {
      label: "Bullet list",
      icon: List,
      active: state?.bulletList,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state?.orderedList,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Checklist",
      icon: CheckSquare,
      active: state?.taskList,
      action: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: state?.blockquote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code block",
      icon: Code2,
      active: state?.codeBlock,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "Insert table",
      icon: Table2,
      active: false,
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      label: "Undo",
      icon: Undo2,
      active: false,
      disabled: !editor.can().undo(),
      action: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      active: false,
      disabled: !editor.can().redo(),
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {editable && (
        <div className="flex shrink-0 flex-wrap gap-1 border-b bg-gray-50 px-4 py-2">
          {toolbarButtons.map(
            ({ label, icon: Icon, active, disabled, action }) => (
              <Button
                key={label}
                type="button"
                variant={active ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                disabled={disabled}
                onClick={action}
                aria-label={label}
                title={label}
              >
                <Icon />
              </Button>
            ),
          )}
        </div>
      )}
      <EditorContent
        editor={editor}
        className="note-markdown rich-text-editor min-h-0 flex-1 overflow-y-auto"
      />
    </div>
  );
}
