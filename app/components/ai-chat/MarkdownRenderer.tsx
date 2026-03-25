"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match?.[1] || "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/60">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={`${className || ""} text-zinc-200`}>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const isInline =
            !className &&
            typeof children === "string" &&
            !children.includes("\n");
          if (isInline) {
            return (
              <code
                className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[13px] font-mono text-amber-300"
                {...props}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre({ children }) {
          return <>{children}</>;
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return (
            <ul className="mb-3 ml-5 list-disc space-y-1 marker:text-zinc-500">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="mb-3 ml-5 list-decimal space-y-1 marker:text-zinc-500">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return (
            <h1 className="mb-3 mt-4 text-xl font-bold text-zinc-100 first:mt-0">
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2 className="mb-2 mt-4 text-lg font-semibold text-zinc-100 first:mt-0">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="mb-2 mt-3 text-base font-semibold text-zinc-200 first:mt-0">
              {children}
            </h3>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
            >
              {children}
            </a>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="my-3 border-l-2 border-amber-500/50 pl-4 text-zinc-400 italic">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="my-3 overflow-x-auto rounded-lg border border-zinc-700">
              <table className="w-full text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border-b border-zinc-700 bg-zinc-800 px-3 py-2 text-left font-medium text-zinc-300">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border-b border-zinc-800 px-3 py-2 text-zinc-300">
              {children}
            </td>
          );
        },
        hr() {
          return <hr className="my-4 border-zinc-700/60" />;
        },
        strong({ children }) {
          return (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          );
        },
        em({ children }) {
          return <em className="text-zinc-300">{children}</em>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
