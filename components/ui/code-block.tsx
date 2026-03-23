"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export function CodeBlock({ code, language = "liquid", filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-1))]">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs text-[hsl(var(--text-muted))] font-mono">{filename}</span>
          )}
          <Badge variant="secondary" className="text-[10px] uppercase">
            {language}
          </Badge>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-[hsl(var(--text-secondary))] leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
