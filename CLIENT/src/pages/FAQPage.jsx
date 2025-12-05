import React from "react";
import { HelpCircle, Package, Truck, CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";

function FAQPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "Once your order is placed, you can track it from the Orders section in your account. You will see real-time status such as Confirmed, Packed, Shipped, and Delivered."
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We support UPI, debit/credit cards, net banking and other secure online payment options through our integrated payment gateway."
    },
    {
      question: "Can I cancel or modify my order?",
      answer:
        "Orders can be cancelled before they are packed for shipping. Once shipped, cancellations may not be possible. For modifications, you can cancel and place a new order."
    },
    {
      question: "What is the return or replacement policy?",
      answer:
        "Most products are eligible for a 7-day return or replacement if they are damaged, defective, or not as described. Eligibility may vary by product category."
    },
    {
      question: "Do I need an account to place an order?",
      answer:
        "Yes, you need to sign in using your mobile or email to place orders. This helps us keep your orders, invoices, and addresses secure and organized."
    },
    {
      question: "Is my payment information safe?",
      answer:
        "Yes. All payments are processed through a secure payment gateway using industry-standard encryption. We do not store your card or UPI details on our servers."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">
            Help Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Find quick answers to common questions about orders, payments, delivery and returns on SwiftCart.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  General questions
                </h2>
                <p className="text-xs text-slate-500">
                  Click on a question to read the answer.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {faqs.map((item, index) => (
                <div key={index} className="py-3">
                  <p className="text-xs font-semibold text-slate-900 mb-1">
                    {item.question}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Topics at a glance
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Orders</p>
                    <p className="text-slate-600">Placing, tracking and managing your orders.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Delivery</p>
                    <p className="text-slate-600">Delivery timelines, delays and shipping questions.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Payments</p>
                    <p className="text-slate-600">Payment methods, failures and refunds.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <RefreshCcw className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Returns</p>
                    <p className="text-slate-600">Return window, conditions and process.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Account & Security</p>
                    <p className="text-slate-600">Login, OTP, and keeping your account safe.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-5">
              <h2 className="text-sm font-semibold mb-2">
                Still need help?
              </h2>
              <p className="text-[11px] text-slate-200 mb-3">
                If you do not find your answer here, you can reach our support team directly from the Contact Us page.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-4 py-1.5 text-[11px] font-semibold hover:bg-slate-100"
              >
                Go to Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
