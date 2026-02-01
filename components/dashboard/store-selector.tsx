"use client"

import { useState } from "react"
import { ChevronsUpDown, Store, Check } from "lucide-react"

export type StoreData = {
  id: string
  name: string
  domain: string
}

type StoreSelectorProps = {
  currentStore: StoreData | null
  stores: StoreData[]
  onStoreChange?: (store: StoreData) => void
}

export function StoreSelector({ currentStore, stores, onStoreChange }: StoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!currentStore) {
    return (
      <div className="w-full flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-2 text-sm text-[#6B7280]">
        <Store className="h-4 w-4" />
        <span>No store connected</span>
      </div>
    )
  }

  const handleStoreSelect = (store: StoreData) => {
    if (onStoreChange) {
      onStoreChange(store)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-[#1F1F1F] bg-[#111111] px-3 py-2 text-left text-sm text-white hover:border-[#2A2A2A] transition-colors"
      >
        <span>
          <span className="block font-medium truncate">{currentStore.name || currentStore.domain}</span>
          <span className="block text-xs text-[#6B7280] truncate">
            {currentStore.domain}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-[#6B7280] flex-shrink-0" />
      </button>

      {isOpen && stores.length > 1 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#1F1F1F] bg-[#111111] shadow-lg">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleStoreSelect(store)}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#1A1A1A] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <span>
                <span className="block font-medium text-white">{store.name || store.domain}</span>
                <span className="block text-xs text-[#6B7280]">{store.domain}</span>
              </span>
              {store.id === currentStore.id && (
                <Check className="h-4 w-4 text-[#FBBF24]" />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && stores.length <= 1 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#1F1F1F] bg-[#111111] shadow-lg p-3 text-xs text-[#6B7280]">
          Multi-store support coming soon
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
