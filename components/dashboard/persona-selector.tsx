"use client"

import { Users, DollarSign, Zap, ShieldQuestion, Smartphone } from "lucide-react"

const personas = [
  {
    id: "balanced",
    name: "Balanced Mix",
    description: "Even split across all shopper types",
    icon: Users,
    recommended: true,
  },
  {
    id: "price-sensitive",
    name: "Price Sensitive",
    description: "Deal hunters and comparison shoppers",
    icon: DollarSign,
    recommended: false,
  },
  {
    id: "impulse",
    name: "Impulse Buyers",
    description: "Fast decisions, value convenience",
    icon: Zap,
    recommended: false,
  },
  {
    id: "skeptical",
    name: "Skeptical",
    description: "Need trust signals and social proof",
    icon: ShieldQuestion,
    recommended: false,
  },
  {
    id: "mobile",
    name: "Mobile Heavy",
    description: "80% mobile users",
    icon: Smartphone,
    recommended: false,
  },
]

interface PersonaSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => {
        const isSelected = selected === persona.id
        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => onSelect(persona.id)}
            className={`relative text-left p-4 border-2 transition-all duration-100 ${
              isSelected
                ? "bg-primary text-primary-foreground border-border brutal-shadow translate-x-[-2px] translate-y-[-2px]"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            {persona.recommended && (
              <span className="absolute -top-3 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 border-2 border-border">
                RECOMMENDED
              </span>
            )}
            <div className="flex items-start gap-3">
              <persona.icon className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <div className="font-bold uppercase tracking-wide text-sm">{persona.name}</div>
                <div className={`text-xs mt-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {persona.description}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
