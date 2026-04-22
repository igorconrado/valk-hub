"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 text-xl font-semibold text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed text-[#ccc]">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-[#bbb]">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6 text-[#ccc]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6 text-[#ccc]">{children}</ol>
  ),
  li: ({ children }) => <li className="text-[#ccc]">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-[var(--border-default)] pl-4 text-[var(--text-muted)]">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="mb-3 overflow-x-auto rounded-lg bg-[#141414] p-4 text-xs text-[#ccc]">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-[#1A1A1A] px-1 py-0.5 text-xs text-[#ddd]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#141414]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-[#2A2A2A] px-3 py-1.5 text-left font-medium text-[#aaa]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[#2A2A2A] px-3 py-1.5 text-[#ccc]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-4 border-[#2A2A2A]" />,
};

interface MarkdownBlockProps {
  content: string;
  className?: string;
}

export function MarkdownBlock({ content, className }: MarkdownBlockProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
