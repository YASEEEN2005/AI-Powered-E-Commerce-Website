import React from "react";
import { ShoppingBag, Users, Globe, ShieldCheck, Sparkles, Truck } from "lucide-react";

function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">
            About SwiftCart
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Built for modern online shopping
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            SwiftCart is a next-generation e-commerce experience designed to make
            shopping fast, personalized, and delightful for everyone.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] mb-8">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Our story
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              SwiftCart started with a simple idea: online shopping should feel
              as smooth and personal as buying from your favorite local store.
              We bring together a clean interface, smart recommendations, and a
              secure checkout experience so customers can focus on what matters
              most – finding the right products.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              From electronics and fashion to daily essentials, SwiftCart is
              built as a full-stack MERN application with AI-powered
              personalization, secure payments, and a seamless user experience
              across devices.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5 text-center">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-lg font-bold text-slate-900">24x7</p>
                <p className="text-[11px] text-slate-500">Smart shopping</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-lg font-bold text-slate-900">AI</p>
                <p className="text-[11px] text-slate-500">Personalized picks</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-lg font-bold text-slate-900">Secure</p>
                <p className="text-[11px] text-slate-500">Protected checkout</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold mb-2">
                What makes SwiftCart different?
              </h2>
              <ul className="space-y-2 text-[11px] text-slate-100">
                <li className="flex gap-2">
                  <Sparkles className="h-4 w-4 mt-[2px]" />
                  <span>
                    AI-powered recommendations show products that actually match
                    your taste and budget.
                  </span>
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="h-4 w-4 mt-[2px]" />
                  <span>
                    Secure payments and order tracking give full confidence from
                    cart to delivery.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Users className="h-4 w-4 mt-[2px]" />
                  <span>
                    Designed for both customers and sellers with dedicated
                    dashboards.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                At a glance
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Multi-category store
                    </p>
                    <p className="text-slate-600">
                      Electronics, fashion, home and more in one platform.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Smooth checkout
                    </p>
                    <p className="text-slate-600">
                      Cart, address, payment and orders managed end-to-end.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Responsive design
                    </p>
                    <p className="text-slate-600">
                      Works beautifully on desktop, tablet and mobile.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Admin & Seller panels
                    </p>
                    <p className="text-slate-600">
                      Manage products, orders, and customers with ease.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Our vision
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            SwiftCart is more than just a project – it is a complete
            demonstration of how modern web technologies, clean UI, and AI can
            come together to build a real e-commerce experience. The goal is to
            deliver an interface that feels premium, reliable, and intuitive
            from the very first click.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            As the platform evolves, SwiftCart can be extended with more
            advanced features like seller analytics, reviews and ratings,
            real-time inventory, and deeper AI-driven insights to create a
            truly intelligent shopping ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
