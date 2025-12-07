import React from "react";

function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Michael L.",
      role: "Customer",
      location: "London, UK",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=12",
      text: `“Thanks guys, keep up the good work! Great job, I will definitely be ordering again!
      The service was worth a fortune to my company.”`,
    },
    {
      id: 2,
      name: "Emily T.",
      role: "Customer",
      location: "Sydney, Australia",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=36",
      text: `“Excellent service and quick response times. Highly recommend to anyone looking for reliable support.
      The team went above and beyond to help with my needs.”`,
    },
  ];

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Real experiences from our happy shoppers
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl bg-slate-50 p-10 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="h-20 w-20 rounded-full object-cover"
                />

                <p className="text-sm font-medium text-slate-700">
                  {review.role}
                </p>

                <div className="flex justify-center gap-1 text-yellow-500 text-lg">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed max-w-lg">
                  {review.text}
                </p>

                <p className="text-slate-900 font-semibold">{review.name}</p>
                <p className="text-xs text-slate-500">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
