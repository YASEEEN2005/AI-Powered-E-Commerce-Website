import React from "react";
import { Truck, Gift, Crown, Cpu } from "lucide-react";

function FeatureSection() {
  const features = [
    {
      icon: <Truck className="h-10 w-10 text-slate-700" />,
      title: "FREE SHIPPING",
      subtitle: "On all orders",
    },
    {
      icon: <Gift className="h-10 w-10 text-slate-700" />,
      title: "MONEY BACK",
      subtitle: "7 days money back guarantee",
    },
    {
      icon: <Crown className="h-10 w-10 text-slate-700" />,
      title: "FRIENDLY SUPPORT",
      subtitle: "Team always ready for you",
    },
    {
      icon: <Cpu className="h-10 w-10 text-slate-700" />,
      title: "AI INTEGRATED",
      subtitle: "Smart personalized shopping",
    },
  ];

  return (
    <section className="w-full py-10 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 place-items-center">

        {features.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-3"
          >
            {item.icon}
            <h3 className="text-lg font-semibold text-slate-900 tracking-wide">
              {item.title}
            </h3>
            <p className="text-sm text-slate-600">
              {item.subtitle}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}

export default FeatureSection;
