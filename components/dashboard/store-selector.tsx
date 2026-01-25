"use client"

import { ChevronsUpDown } from "lucide-react"

type Store = {
  id: string
  name: string
  domain: string
}

type StoreSelectorProps = {
  currentStore: Store
  stores: Store[]
}

export function StoreSelector({ currentStore, stores }: StoreSelectorProps) {
  return (
    <button
      type="button"
      className="relative w-full flex items-center justify-between rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-2 text-left text-sm text-white hover:border-[#2A2A2A]"
    >
      <span>
        <span className="block font-medium">{currentStore.name}</span>
        <span className="block text-xs text-[#6B7280]">
          {currentStore.domain}.myshopify.com
        </span>
      </span>
      <ChevronsUpDown className="h-4 w-4 text-[#6B7280]" />
      <span className="sr-only">Select store</span>
      <select className="absolute opacity-0 pointer-events-none">
        {stores.map((store) => (
          <option key={store.id}>{store.name}</option>
        ))}
      </select>
    </button>
  )
}
