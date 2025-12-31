"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { mockScoreHistory } from "@/lib/mock-data"

export function ScoreChart() {
  return (
    <div className="bg-card border-2 border-border brutal-shadow p-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-6">Score History</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockScoreHistory} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" strokeWidth={1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fontFamily: "Space Mono", fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fontFamily: "Space Mono", fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border-2 border-border brutal-shadow p-3">
                      <p className="font-mono font-bold text-lg">{payload[0].value}</p>
                      <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="linear"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--foreground)", stroke: "var(--foreground)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--foreground)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
