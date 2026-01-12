"use client"

import { motion } from "framer-motion"
import { Users, Zap } from "lucide-react"

interface LiveStageProps {
  storeUrl?: string
  frictionPoints?: number
}

export function LiveStage({ storeUrl = "https://demo.shopify.com", frictionPoints = 3 }: LiveStageProps) {
  return (
    <div className="relative h-full min-h-[600px] w-full flex items-center justify-center bg-[#050505] rounded-3xl border border-white/10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[#0070F3]/5 blur-3xl" />
      
      {/* iPhone Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-[300px] h-[600px] bg-black rounded-[40px] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden ring-1 ring-white/20"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1a] rounded-b-xl z-20" />
        
        {/* Content (Iframe) */}
        <iframe 
          src={storeUrl} 
          className="w-full h-full bg-white"
          style={{ border: "none" }}
          title="Live Store Preview"
        />

        {/* Ghost Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none z-10">
           {/* Simulated Friction Point 1 */}
           <motion.div 
             animate={{ scale: [1, 1.2, 1] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute top-[45%] right-4 w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center border border-red-500"
           >
             <div className="w-2 h-2 rounded-full bg-red-500" />
           </motion.div>
        </div>
      </motion.div>

      {/* Floating Insight Card */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-24 right-8 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl max-w-[200px]"
      >
        <div className="flex items-center gap-2 mb-2">
           <div className="p-1.5 bg-red-500/10 rounded-md">
             <Zap className="w-4 h-4 text-red-500" />
           </div>
           <span className="text-xs font-bold text-white uppercase">Critical</span>
        </div>
        <p className="text-xs text-zinc-400">
          "Add to Cart" is below the fold on iPhone 14.
        </p>
      </motion.div>
    </div>
  )
}
