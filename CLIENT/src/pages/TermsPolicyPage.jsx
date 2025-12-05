import React from "react";
import { FileText, ShieldCheck, Scale, AlertCircle } from "lucide-react";

function TermsPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">
            Terms & Policy
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Terms and Conditions
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            These terms explain how SwiftCart works, your responsibilities as a user, and how we handle orders, payments, and data on this platform.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                1. Introduction
              </h2>
              <p>
                By accessing or using SwiftCart, you agree to these Terms and Conditions. If you do not agree, you should not use this website or create an account.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                2. Your account
              </h2>
              <p>
                To place orders on SwiftCart, you need to create an account or sign in using your verified mobile number or email. You are responsible for maintaining the confidentiality of your login details and all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                3. Products, pricing and availability
              </h2>
              <p>
                We try our best to display accurate product information, images and pricing. However, errors may occur. In such cases, we reserve the right to update details, cancel orders, or contact you for confirmation before processing.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                4. Orders and payments
              </h2>
              <p>
                When you place an order, you will receive an order confirmation on the platform. This does not guarantee acceptance of the order. Orders may be cancelled due to stock issues, payment failures, or verification problems. All payments are processed through secure third-party payment gateways integrated with SwiftCart.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                5. Shipping and delivery
              </h2>
              <p>
                Estimated delivery dates shown on the website are indicative and may vary due to logistics or location. Delays caused by courier partners, weather, or other external factors are sometimes beyond our direct control, but we will always try to keep you updated through the Orders section.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                6. Returns, replacements and refunds
              </h2>
              <p>
                Return or replacement eligibility depends on the product category and condition. Items must usually be unused, with original packaging and proof of purchase. Refunds, where applicable, are processed to the original payment method within a reasonable time after the returned item is inspected and approved.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                7. Use of the website
              </h2>
              <p>
                You agree not to misuse the platform, attempt to bypass security, use automated scripts to access or scrape data, or upload harmful content. We may suspend or terminate access if we detect any abusive or fraudulent activity linked to your account.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                8. Intellectual property
              </h2>
              <p>
                All branding, logos, design elements, and code used in SwiftCart are part of the project and should not be copied or redistributed without permission. Product images and brand names may belong to their respective owners and are used for demonstration purposes.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                9. Limitation of liability
              </h2>
              <p>
                SwiftCart is provided as a demonstration e-commerce platform. To the maximum extent permitted by law, we are not liable for any indirect, incidental or consequential damages resulting from the use or inability to use the website, including any loss of data or profits.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                10. Changes to these terms
              </h2>
              <p>
                We may update these Terms and Conditions from time to time. Any changes will be reflected on this page, and continued use of the website after changes means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                11. Contact
              </h2>
              <p>
                For any questions about these Terms and Conditions, you can reach us using the details on the Contact Us page.
              </p>
            </section>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Summary
              </h2>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Simple, transparent usage
                    </p>
                    <p>
                      Use SwiftCart responsibly for browsing products, placing orders, and managing your account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Secure payments
                    </p>
                    <p>
                      Payments are handled by trusted gateways with encryption to protect your information.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Fair policies
                    </p>
                    <p>
                      Returns, refunds and cancellations follow clear rules to protect both customers and sellers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-5">
              <h2 className="text-sm font-semibold mb-2">
                Important note
              </h2>
              <div className="flex gap-3 text-[11px] text-slate-100">
                <AlertCircle className="h-5 w-5 mt-[2px]" />
                <p>
                  SwiftCart is a project built for demonstration and educational purposes. The flows for products, payments and orders are designed to represent a real e-commerce system, but do not represent a live commercial marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsPolicyPage;
