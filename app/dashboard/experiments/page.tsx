import { FlaskConical } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function ExperimentsPage() {
  return (
    <EmptyState
      icon={FlaskConical}
      title="Experiments coming soon"
      description="A/B testing and theme experiments are in development. Stay tuned for updates."
      className="min-h-[60vh]"
    />
  )
}
