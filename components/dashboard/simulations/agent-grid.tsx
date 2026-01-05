"use client"

interface Agent {
  id: string
  name: string
  status: "ACTIVE" | "STUCK" | "IDLE"
  location: string
  action: string
  cartValue: string
  latency: string
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "AGENT-01",
    status: "STUCK",
    location: "/products/blue-jeans",
    action: "Timeout 5000ms",
    cartValue: "$0.00",
    latency: "5000ms",
  },
  {
    id: "2",
    name: "AGENT-02",
    status: "ACTIVE",
    location: "/checkout",
    action: "Filling Shipping Form",
    cartValue: "$124.50",
    latency: "45ms",
  },
  {
    id: "3",
    name: "AGENT-03",
    status: "ACTIVE",
    location: "/cart",
    action: "Reviewing Cart Items",
    cartValue: "$156.75",
    latency: "41ms",
  },
  {
    id: "4",
    name: "AGENT-04",
    status: "ACTIVE",
    location: "/products/black-hoodie",
    action: "Attempting 'Add to Cart'",
    cartValue: "$84.00",
    latency: "42ms",
  },
  {
    id: "5",
    name: "AGENT-05",
    status: "ACTIVE",
    location: "/products/white-sneakers",
    action: "Browsing Product Page",
    cartValue: "$0.00",
    latency: "38ms",
  },
  {
    id: "6",
    name: "AGENT-06",
    status: "ACTIVE",
    location: "/products/red-t-shirt",
    action: "Attempting 'Add to Cart'",
    cartValue: "$29.99",
    latency: "39ms",
  },
  {
    id: "7",
    name: "AGENT-07",
    status: "IDLE",
    location: "/",
    action: "Waiting for task",
    cartValue: "$0.00",
    latency: "0ms",
  },
  {
    id: "8",
    name: "AGENT-08",
    status: "IDLE",
    location: "/",
    action: "Waiting for task",
    cartValue: "$0.00",
    latency: "0ms",
  },
]

export function AgentGrid() {
  const getStatusBadge = (status: Agent["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        )
      case "STUCK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-300">
            STUCK
          </span>
        )
      case "IDLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            IDLE
          </span>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockAgents.map((agent) => (
        <div
          key={agent.id}
          className={`rounded-xl border bg-white shadow-sm p-4 ${
            agent.status === "STUCK"
              ? "border-red-300"
              : "border-zinc-200"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-mono text-zinc-900">
              {agent.name}
            </span>
            {getStatusBadge(agent.status)}
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div>
              <div className="text-xs text-zinc-500 truncate">
                {agent.location}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-blue-600">
                {agent.action}
              </div>
            </div>

            <div>
              <div className="text-sm font-mono text-zinc-900">
                {agent.cartValue}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-zinc-100">
            <div className="text-[10px] text-zinc-400">
              Latency: {agent.latency}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
