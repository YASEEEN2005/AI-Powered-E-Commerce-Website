import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

const banners = [
  {
    id: 1,
    label: "PERSONALIZED PICKS",
    title: "Made For You",
    subtitle: "AI-powered styles you’ll actually love.",
    cta: "View Recommendations",
    bg: "bg-[#c8ded5]",
    image:
      "https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    label: "LIMITED TIME",
    title: "Flat 50% Off",
    subtitle: "Handpicked deals curated by our AI engine.",
    cta: "Shop Deals",
    bg: "bg-[#f6d9c5]",
    image:
      "https://images.pexels.com/photos/9945171/pexels-photo-9945171.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    label: "BLACK FRIDAY SALE",
    title: "Back Friday Fever",
    subtitle: "Exclusive midnight drops, dynamic AI pricing.",
    cta: "Explore Offers",
    bg: "bg-[#d6d7ff]",
    image:
      "https://images.pexels.com/photos/7671168/pexels-photo-7671168.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    label: "JUST ARRIVED",
    title: "New Arrivals",
    subtitle: "Fresh drops tailored to your vibe.",
    cta: "Browse Collection",
    bg: "bg-[#e1e9ff]",
    image:
      "https://images.pexels.com/photos/4464821/pexels-photo-4464821.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const banner = banners[current];

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto max-w-[1400px] px-6">
        <div
          className={`relative flex min-h-[340px] items-center overflow-hidden rounded-3xl ${banner.bg} px-6 py-10 sm:px-10 lg:px-14`}
        >
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="z-10 flex-1 space-y-4 lg:space-y-6">
            <p className="text-xs tracking-[0.3em] text-slate-700 uppercase">
              {banner.label}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
              {banner.title}
            </h1>
            <p className="max-w-md text-sm text-slate-800 sm:text-base">
              {banner.subtitle}
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-black">
              {banner.cta}
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <div className="flex gap-2 pt-3">
              {banners.map((b, index) => (
                <button
                  key={b.id}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 w-6 rounded-full transition ${
                    index === current ? "bg-slate-900" : "bg-slate-400/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-800 sm:right-6 sm:top-5">
            {current + 1} / {banners.length}
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center pr-8 md:flex">
            <img
              src={banner.image}
              alt={banner.title}
              className="max-h-[320px] w-auto object-contain drop-shadow-xl"
            />
          </div>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex w-full justify-center md:hidden">
            <img
              src={banner.image}
              alt={banner.title}
              className="max-h-56 w-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
