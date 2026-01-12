"use client"

import { useState, useEffect } from "react"

interface ShopperEvent {
  id: string
  time: string
  device: string
  eventStream: string
  potentialLoss: string
  status: "ANALYZING" | "PASSIVE"
}

const mockEvents: ShopperEvent[] = [
  {
    id: "1",
    time: "14:32:18",
    device: "Mobile iOS",
    eventStream: "Cart Abandon (Shipping)",
    potentialLoss: "$89.50",
    status: "ANALYZING",
  },
  {
    id: "2",
    time: "14:31:45",
    device: "Desktop Chrome",
    eventStream: "Checkout Error API 500",
    potentialLoss: "$124.00",
    status: "ANALYZING",
  },
  {
    id: "3",
    time: "14:30:12",
    device: "Mobile Android",
    eventStream: "Smooth Session",
    potentialLoss: "$0.00",
    status: "PASSIVE",
  },
  {
    id: "4",
    time: "14:29:33",
    device: "Desktop Safari",
    eventStream: "Cart Abandon (Payment)",
    potentialLoss: "$67.25",
    status: "ANALYZING",
  },
  {
    id: "5",
    time: "14:28:07",
    device: "Mobile iOS",
    eventStream: "Smooth Session",
    potentialLoss: "$0.00",
    status: "PASSIVE",
  },
  {
    id: "6",
    time: "14:27:22",
    device: "Desktop Firefox",
    eventStream: "Cart Abandon (Shipping)",
    potentialLoss: "$156.75",
    status: "ANALYZING",
  },
]

export function ShopperFeed() {
  const [events, setEvents] = useState<ShopperEvent[]>(mockEvents)
  const [newRowKey, setNewRowKey] = useState(0)

  // Simulate live data coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setNewRowKey((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Helper to highlight key words in event stream
  const formatEventStream = (text: string) => {
    if (text.includes("Cart Abandon")) {
      const parts = text.split("Cart Abandon")
      return (
        <>
          <span className="font-semibold text-red-400">Cart Abandon</span>
          <span className="text-zinc-400">{parts[1]}</span>
        </>
      )
    }
    if (text.includes("Checkout Error")) {
      const parts = text.split("Checkout Error")
      return (
        <>
          <span className="font-semibold text-red-400">Checkout Error</span>
          <span className="text-zinc-400">{parts[1]}</span>
        </>
      )
    }
    return <span className="text-zinc-500">{text}</span>
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          LIVE SIMULATION LOG
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="border-b border-white/[0.08] sticky top-0 bg-[#020202]/90 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                TIME
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                DEVICE
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                EVENT STREAM
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                POTENTIAL LOSS
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {events.map((event, index) => (
              <tr
                key={event.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-xs font-mono text-zinc-400 tabular-nums">
                  {event.time}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {event.device}
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatEventStream(event.eventStream)}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-white text-right tabular-nums">
                  {event.potentialLoss}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                      event.status === "ANALYZING"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-white/[0.05] text-zinc-500 border border-white/[0.08]"
                    }`}
                  >
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
