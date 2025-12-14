import React, { useEffect, useRef, useState } from "react";

/**
 * Testimonials
 *
 * Props:
 *  - reviews: array of review objects (default sample provided)
 *  - columns: number of columns on medium+ screens (default 2)
 *  - autoPlay: boolean to auto-advance testimonials (default false)
 *  - interval: milliseconds for autoplay (default 5000)
 */
function Testimonials({
  reviews: incomingReviews,
  columns = 2,
  autoPlay = false,
  interval = 5000,
}) {
  const defaultReviews = [
    {
      id: 1,
      name: "Michael L.",
      role: "Customer",
      location: "London, UK",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=12",
      text: `Thanks guys — great job! I will definitely be ordering again. The
      service added huge value to our company.`,
    },
    {
      id: 2,
      name: "Emily T.",
      role: "Customer",
      location: "Sydney, Australia",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=36",
      text: `Excellent service and quick responses. Highly recommended — the
      team went above and beyond to help me.`,
    },
  ];

  const reviews = Array.isArray(incomingReviews)
    ? incomingReviews
    : defaultReviews;

  // For autoplay/simple carousel
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, reviews.length]);

  const goTo = (i) => {
    setIndex(i % reviews.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // helper: render stars (supports halves)
  const Stars = ({ value = 0, size = 16 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (value >= i) {
        // full
        stars.push(
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
            className="text-amber-400"
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.7l5.9-.9L10 1.5z" />
          </svg>
        );
      } else if (value >= i - 0.5) {
        // half star (use clipped full star)
        stars.push(
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden
            className="text-amber-400"
          >
            <defs>
              <linearGradient id={`halfGrad${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.7l5.9-.9L10 1.5z"
              fill={`url(#halfGrad${i})`}
            />
            <path
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9"
              fill="none"
              stroke="rgba(0,0,0,0.06)"
            />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            aria-hidden
            className="text-amber-300"
          >
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 18.8l1-5.9L1.5 8.7l5.9-.9L10 1.5z" />
          </svg>
        );
      }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // Avatar component with fallback initials
  const Avatar = ({ src, name, size = 56 }) => {
    const [err, setErr] = useState(false);
    const initials = (name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return err || !src ? (
      <div
        className="rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initials || "U"}
      </div>
    ) : (
      // eslint-disable-next-line jsx-a11y/img-redundant-alt
      <img
        src={src}
        alt={name ? `${name} avatar` : "avatar"}
        onError={() => setErr(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  };

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">
            Real experiences from happy shoppers — short, honest reviews to help
            you decide.
          </p>
        </div>

        {/* cards / carousel */}
        <div className="relative">
          <div
            className={`grid gap-6 ${
              columns === 3
                ? "md:grid-cols-3"
                : columns === 1
                ? "md:grid-cols-1"
                : "md:grid-cols-2"
            }`}
            aria-live="polite"
          >
            {reviews.map((r, i) => {
              const isActive = i === index || !autoPlay;
              // simple fade-in/out + translate
              return (
                <article
                  key={r.id}
                  className={`rounded-2xl p-8 bg-slate-50 shadow-sm transform transition duration-400 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-2"
                  } hover:shadow-md`}
                  role="article"
                  aria-label={`testimonial from ${r.name}`}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar src={r.image} name={r.name} size={72} />

                    <div className="flex flex-col items-center gap-1">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.role} • {r.location}</p>
                    </div>

                    <div className="mt-2">
                      <Stars value={r.rating} size={18} />
                    </div>

                    <blockquote className="text-slate-700 text-sm leading-relaxed max-w-xl">
                      <span className="text-3xl text-slate-300 leading-none mr-2">“</span>
                      <span className="inline-block align-middle">{r.text}</span>
                    </blockquote>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => goTo(Math.max(0, i - 1))}
                        aria-label="previous testimonial"
                        className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => goTo(i + 1)}
                        aria-label="next testimonial"
                        className="px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 w-8 rounded-full transition-all ${
                  i === index ? "bg-slate-900 w-8" : "bg-slate-200 w-4"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
