"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Ga4Property {
  id: string
  displayName: string
  accountName?: string
  createTime?: string
}

interface Ga4PropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function Ga4PropertyModal({ open, onOpenChange, onSaved }: Ga4PropertyModalProps) {
  const [properties, setProperties] = useState<Ga4Property[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reconnect, setReconnect] = useState(false)

  useEffect(() => {
    if (!open) return

    setError(null)
    setReconnect(false)
    setSelectedId(null)
    setIsLoading(true)

    fetch("/api/analytics/ga4/properties")
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 401 && data.reconnect) {
            setReconnect(true)
            setError(data.error ?? "GA4 connection expired. Please reconnect your account.")
          } else {
            setError(data.error ?? "Failed to load properties")
          }
          setProperties([])
          return
        }
        if (data.success && Array.isArray(data.properties)) {
          setProperties(data.properties)
          if (data.properties.length === 1) {
            setSelectedId(data.properties[0].id)
          }
        } else {
          setProperties([])
          setError("No properties returned")
        }
      })
      .catch(() => {
        setError("Failed to load properties")
        setProperties([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [open])

  const handleSave = async () => {
    if (!selectedId) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/analytics/ga4/select-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: selectedId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to save property")
        return
      }
      onSaved?.()
      onOpenChange(false)
    } catch {
      setError("Failed to save property")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--ghost-text-secondary)] bg-white text-[var(--ghost-bg-secondary)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--ghost-bg-secondary)]">Select GA4 property</DialogTitle>
          <DialogDescription className="text-[var(--ghost-text-dim)]">
            Choose which Google Analytics 4 property to use for demographics data.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--ghost-text-muted)]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
            {reconnect && (
              <p className="mt-2 text-xs">
                Go to the GA4 card below and click Re-connect, then try again.
              </p>
            )}
          </div>
        ) : properties.length === 0 ? (
          <p className="text-sm text-[var(--ghost-text-dim)]">No GA4 properties found in your account.</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-[var(--ghost-text-secondary)] p-2">
            {properties.map((prop) => (
              <label
                key={prop.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--ghost-text-secondary)] p-3 transition-colors hover:bg-white/5 has-[:checked]:border-[var(--ghost-text-muted)] has-[:checked]:bg-white/5"
              >
                <input
                  type="radio"
                  name="ga4-property"
                  value={prop.id}
                  checked={selectedId === prop.id}
                  onChange={() => setSelectedId(prop.id)}
                  className="mt-1 h-4 w-4 border-[var(--ghost-text-muted)] text-[var(--ghost-bg-secondary)] focus:ring-[var(--ghost-text-dim)]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--ghost-bg-secondary)]">{prop.displayName}</span>
                  {prop.accountName && (
                    <p className="text-xs text-[var(--ghost-text-dim)]">{prop.accountName}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {!isLoading && !error && properties.length > 0 && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={!selectedId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
