import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email and message");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Thank you, we will get back to you soon.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">
            Contact SwiftCart
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            We are here to help you
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Questions about orders, payments, or products? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.9fr]">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Send us a message
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in the form and our support team will contact you.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Order issue, payment, feedback..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-500 max-w-xs">
                  By submitting this form, you agree to be contacted by our support team using the details provided above.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-3 w-3 rounded-full border border-white/40 border-t-transparent animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Contact information
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-500">Customer Support</p>
                    <p className="font-medium text-slate-900">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">
                      support@swiftcart.in
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-500">Office</p>
                    <p className="font-medium text-slate-900">
                      SwiftCart HQ, Kochi, Kerala, India
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-500">Support hours</p>
                    <p className="font-medium text-slate-900">
                      Mon – Sat, 9:00 AM – 7:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Order and payment help
              </h2>
              <p className="text-xs text-slate-600 mb-3">
                For issues related to existing orders, delayed delivery, payment failures, or refunds, please mention your order ID in the message.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">Orders</p>
                  <p className="text-slate-600">Track and manage your orders</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">Payments</p>
                  <p className="text-slate-600">Refunds and payment support</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">Returns</p>
                  <p className="text-slate-600">Return and replacement policy</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">Partnerships</p>
                  <p className="text-slate-600">Sell with SwiftCart</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold mb-1">
                Need quick help?
              </h2>
              <p className="text-[11px] text-slate-200 mb-3">
                Check our FAQ and support articles for instant answers to common questions.
              </p>
              <a
                href="/faq"
                className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-4 py-1.5 text-[11px] font-semibold hover:bg-slate-100"
              >
                Go to Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
