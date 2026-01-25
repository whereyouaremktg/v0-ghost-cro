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
      <DialogContent className="border border-[#1F1F1F] bg-[#111111] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[#9CA3AF]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
