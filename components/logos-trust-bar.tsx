export function LogosTrustBar() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-medium text-gray-500 mb-8 tracking-wide">
          Powering CRO for fast-growing Shopify brands
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
          {/* Placeholder brand logos - replace with actual merchant logos */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded grayscale hover:grayscale-0 transition-all" />
          ))}
        </div>
      </div>
    </section>
  )
}

