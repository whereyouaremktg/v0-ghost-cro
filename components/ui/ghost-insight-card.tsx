'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GhostInsightCardProps {
  label?: string
  title: string
  suggestion?: string
  metric?: string
  metricType?: 'positive' | 'negative'
  className?: string
  delay?: number
}

export function GhostInsightCard({
  label = 'Ghost Insight',
  title,
  suggestion,
  metric,
  metricType = 'positive',
  className,
  delay = 0,
}: GhostInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'bg-[#111111]/90 backdrop-blur-sm border border-[#1F1F1F] rounded-lg p-4 w-[220px] shadow-xl',
        className
      )}
    >
      {/* Header with status dot */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>

      {/* Title */}
      <div className="text-sm text-white mb-1">{title}</div>

      {/* Suggestion if provided */}
      {suggestion && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">→</span>
          <span className="text-[#FBBF24]">{suggestion}</span>
        </div>
      )}

      {/* Metric if provided */}
      {metric && (
        <div className="mt-3 flex items-center gap-2">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full flex items-center justify-center',
              metricType === 'positive' ? 'bg-green-500/20' : 'bg-red-500/20'
            )}
          >
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                metricType === 'positive' ? 'bg-green-500' : 'bg-red-500'
              )}
            />
          </div>
          <span
            className={cn(
              'text-sm',
              metricType === 'positive' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {metric}
          </span>
        </div>
      )}
    </motion.div>
  )
}
