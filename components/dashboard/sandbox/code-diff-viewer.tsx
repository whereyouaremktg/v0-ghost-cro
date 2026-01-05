"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeDiffViewerProps {
  originalCode?: string
  optimizedCode?: string
  targetFile?: string
  language?: string
}

export function CodeDiffViewer({ 
  originalCode = "", 
  optimizedCode = "", 
  targetFile = "checkout.liquid",
  language = "liquid"
}: CodeDiffViewerProps) {
  // If no code provided, show placeholder
  const hasCode = originalCode || optimizedCode

  const handleCopyCode = () => {
    if (optimizedCode) {
      navigator.clipboard.writeText(optimizedCode)
    }
  }

  // Simple diff rendering - split by lines
  const originalLines = originalCode ? originalCode.split('\n') : []
  const optimizedLines = optimizedCode ? optimizedCode.split('\n') : []

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0D1117] shadow-2xl overflow-hidden">
      {/* File Tab Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#161B22] px-4">
        <div className="flex items-center gap-1">
          <div className="px-4 py-2 text-xs font-medium text-zinc-300 bg-[#0D1117] border-t border-x border-zinc-800 rounded-t-md">
            {targetFile}
          </div>
        </div>
        {optimizedCode && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="text-zinc-400 hover:text-zinc-300 h-7"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Code
          </Button>
        )}
      </div>

      {/* Code Content */}
      <div className="p-4 font-mono text-sm max-h-[400px] overflow-y-auto">
        {!hasCode ? (
          <div className="text-zinc-500 text-center py-8">
            <p>No code fix available for this recommendation.</p>
            <p className="text-xs mt-2">Please refer to the implementation steps below.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Show original code if exists */}
            {originalCode && (
              <>
                {originalLines.map((line, i) => (
                  <div key={`orig-${i}`} className="flex bg-red-900/20">
                    <span className="text-zinc-600 w-12 text-right pr-4 select-none">{i + 1}</span>
                    <span className="text-red-400 flex-1">- {line || ' '}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show optimized code */}
            {optimizedCode && (
              <>
                {optimizedLines.map((line, i) => (
                  <div key={`opt-${i}`} className="flex bg-green-900/20">
                    <span className="text-zinc-600 w-12 text-right pr-4 select-none">{i + 1}</span>
                    <span className="text-green-400 flex-1">+ {line || ' '}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-zinc-800 bg-[#161B22] px-4 py-2 flex items-center gap-4 text-xs text-zinc-500 font-mono">
        <span>{optimizedLines.length > 0 ? `Ln ${optimizedLines.length}` : 'No code'}</span>
        <span>•</span>
        <span>UTF-8</span>
        <span>•</span>
        <span className="capitalize">{language}</span>
      </div>
    </div>
  )
}

