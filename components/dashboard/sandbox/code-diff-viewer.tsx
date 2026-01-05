"use client"

export function CodeDiffViewer() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0D1117] shadow-2xl overflow-hidden">
      {/* File Tab Bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800 bg-[#161B22] px-4">
        <div className="px-4 py-2 text-xs font-medium text-zinc-300 bg-[#0D1117] border-t border-x border-zinc-800 rounded-t-md">
          checkout.liquid
        </div>
        <div className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
          theme.js
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 font-mono text-sm">
        {/* Line numbers and code */}
        <div className="space-y-0.5">
          {/* Context lines */}
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">10</span>
            <span className="text-zinc-300 flex-1">  &lt;script src="blocking-analytics.js"&gt;&lt;/script&gt;</span>
          </div>
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">11</span>
            <span className="text-zinc-300 flex-1">  &lt;div class="checkout-container"&gt;</span>
          </div>

          {/* Removed line */}
          <div className="flex bg-red-900/20">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">12</span>
            <span className="text-red-400 flex-1">- &lt;script src="blocking-analytics.js"&gt;&lt;/script&gt;</span>
          </div>

          {/* Added line */}
          <div className="flex bg-green-900/20">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">13</span>
            <span className="text-green-400 flex-1">+ &lt;script src="analytics.js" defer&gt;&lt;/script&gt;</span>
          </div>

          {/* Context lines */}
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">14</span>
            <span className="text-zinc-300 flex-1">  &lt;div class="checkout-form"&gt;</span>
          </div>
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">15</span>
            <span className="text-zinc-300 flex-1">    &lt;input type="email" placeholder="Email" /&gt;</span>
          </div>
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">16</span>
            <span className="text-zinc-300 flex-1">    &lt;button type="submit"&gt;Complete Order&lt;/button&gt;</span>
          </div>
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">17</span>
            <span className="text-zinc-300 flex-1">  &lt;/div&gt;</span>
          </div>
          <div className="flex">
            <span className="text-zinc-600 w-12 text-right pr-4 select-none">18</span>
            <span className="text-zinc-300 flex-1">  &lt;/div&gt;</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-zinc-800 bg-[#161B22] px-4 py-2 flex items-center gap-4 text-xs text-zinc-500 font-mono">
        <span>Ln 14, Col 22</span>
        <span>•</span>
        <span>UTF-8</span>
        <span>•</span>
        <span>Liquid</span>
      </div>
    </div>
  )
}

