import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export function NotePreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Nothing to preview yet.
      </div>
    );
  }

  return (
    <article className="note-markdown mx-auto max-w-4xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
