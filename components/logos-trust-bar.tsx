"use client"

const brands = [
  { name: "LUXEBRAND", font: "font-sans tracking-wider font-light" },
  { name: "HOMEGOODS CO", font: "font-sans tracking-tight font-bold" },
  { name: "BEAUTYBOX", font: "font-mono tracking-wide font-medium" },
  { name: "TECHGEAR", font: "font-sans tracking-wider font-extrabold" },
  { name: "PETWELL", font: "font-sans tracking-normal font-semibold" },
  { name: "FITFORM", font: "font-sans tracking-wide font-bold" },
]

export function LogosTrustBar() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-800 overflow-hidden bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-medium text-gray-500 mb-10 tracking-wide uppercase">
          Trusted by growing Shopify brands
        </p>

        {/* Marquee container */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />

          {/* Scrolling track */}
          <div className="flex gap-20 animate-scroll">
            {/* First set */}
            {brands.map((brand, i) => (
              <div
                key={`first-${i}`}
                className={`${brand.font} text-2xl text-gray-600 whitespace-nowrap flex-shrink-0 hover:text-gray-400 transition-colors duration-300`}
              >
                {brand.name}
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {brands.map((brand, i) => (
              <div
                key={`second-${i}`}
                className={`${brand.font} text-2xl text-gray-600 whitespace-nowrap flex-shrink-0 hover:text-gray-400 transition-colors duration-300`}
              >
                {brand.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}


