"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type GhostDialogProps = {
  title: string
  description?: string
  trigger: React.ReactNode
  children: React.ReactNode
}

export function GhostDialog({
  title,
  description,
  trigger,
  children,
}: GhostDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border border-[var(--ghost-border)] bg-[var(--ghost-bg-secondary)] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[var(--ghost-text-muted)]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
