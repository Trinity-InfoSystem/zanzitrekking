"use client";
import { useEffect } from "react";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle,
  Copyright,
  CreditCard,
  FileText,
  Gavel,
  Mail,
  RefreshCw,
  Scale,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const TermsOfService = () => {
  useEffect(() => {
    AOS.init({
      duration: 400,
      once: true,
      offset: 60,
    });
  }, []);

  return (
    <div className="from-background-nature to-background-sunset min-h-screen bg-gradient-to-br via-white">
      <SEO/>
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 py-20 lg:py-24">
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-secondary-500/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-sm">
              <FileText className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                TERMS & CONDITIONS
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white lg:text-5xl">
              Terms of Service
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              Please read these terms carefully before using our safari booking
              platform. By using our services, you agree to these terms.
            </p>

            <div className="flex items-center justify-center gap-3 text-sm text-white/80">
              <span>Home</span>
              <span>/</span>
              <span className="font-semibold text-white">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="relative -mt-16 pb-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
            data-aos="fade-up"
          >
            {/* Header Card */}
            <div className="from-background-nature to-background-sunset border-b border-neutral-200 bg-gradient-to-br p-8 text-center lg:p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5">
                <FileText className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  Last Updated: January 15, 2025
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-primary-800">
                Terms of Service
              </h2>
              <p className="mx-auto max-w-2xl text-base text-text-light">
                These terms govern your use of Zanzi Trekking & Safaris booking
                platform and services.
              </p>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-12">
              {/* Section 1 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Acceptance of Terms
                  </h3>
                </div>

                <div className="to-background-nature rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-6">
                  <p className="mb-4 text-base leading-relaxed text-text-light">
                    By accessing and using Zanzi Trekking & Safaris services,
                    including our website, mobile applications, and booking
                    platform, you accept and agree to be bound by these Terms of
                    Service.
                  </p>
                  <div className="space-y-3">
                    {[
                      "You must be at least 18 years old to make bookings",
                      "If booking for minors, you must be their legal guardian",
                      "You agree to provide accurate and complete information",
                      "You are responsible for maintaining account security",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                        <p className="text-text-light">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="200">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 shadow-lg">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Bookings & Payments
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  All bookings are subject to availability and confirmation.
                  Full payment is required to secure your reservation.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      </div>
                      <h4 className="font-bold text-primary-700">
                        Payment Terms
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-text-light">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary-500">•</span>
                        Full payment required at booking
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary-500">•</span>
                        Secure payment processing via Stripe/PayPal
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary-500">•</span>
                        Prices in USD unless otherwise stated
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary-500">•</span>
                        Confirmation sent within 24 hours
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100">
                        <Shield className="h-5 w-5 text-secondary-600" />
                      </div>
                      <h4 className="font-bold text-secondary-700">
                        Booking Confirmation
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-text-light">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary-500">•</span>
                        Email confirmation with itinerary
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary-500">•</span>
                        Booking reference number provided
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary-500">•</span>
                        Pre-trip information and guidelines
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary-500">•</span>
                        24/7 customer support access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 - Cancellation Policy */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="300">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
                    <RefreshCw className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Cancellation & Refund Policy
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  We understand plans change. Our cancellation policy is
                  designed to be fair while protecting our operations and
                  partners.
                </p>

                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border-2 border-success-200 bg-gradient-to-br from-success-50 to-white">
                    <div className="flex items-center gap-3 border-b border-success-200 bg-success-100 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-success-800">
                          7+ Days Before Tour
                        </h4>
                        <p className="text-sm text-success-700">Full Refund</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-text-light">
                        Cancel 7 or more days before your scheduled tour date
                        and receive a 100% refund of your payment, minus any
                        non-refundable processing fees (typically 3-5%).
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-white">
                    <div className="flex items-center gap-3 border-b border-warning-200 bg-warning-100 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-warning-800">
                          3-6 Days Before Tour
                        </h4>
                        <p className="text-sm text-warning-700">50% Refund</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-text-light">
                        Cancel between 3-6 days before your tour and receive 50%
                        of your payment. The remaining amount covers committed
                        costs to our partners and operators.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-error-200 bg-gradient-to-br from-error-50 to-white">
                    <div className="flex items-center gap-3 border-b border-error-200 bg-error-100 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-500">
                        <XCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-error-800">
                          Less Than 3 Days / No-Show
                        </h4>
                        <p className="text-sm text-error-700">No Refund</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-text-light">
                        Cancellations within 3 days or no-shows are
                        non-refundable. All costs have been committed to guides,
                        accommodations, and transportation at this point.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-neutral-200 bg-background-paper p-5">
                  <h4 className="mb-3 font-bold text-primary-700">
                    Important Notes:
                  </h4>
                  <ul className="space-y-2 text-sm text-text-light">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary-500">•</span>
                      Refunds processed within 5-10 business days
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary-500">•</span>
                      Force majeure events may qualify for full refund or
                      rescheduling
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary-500">•</span>
                      Travel insurance is highly recommended for all bookings
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-primary-500">•</span>
                      Custom group tours may have different cancellation terms
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="400">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    User Responsibilities
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  As a participant in our safaris and treks, you agree to the
                  following responsibilities to ensure everyone&apos;s safety and
                  enjoyment.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: Shield,
                      title: "Accurate Information",
                      desc: "Provide truthful booking details, medical conditions, dietary requirements, and emergency contacts.",
                    },
                    {
                      icon: CheckCircle,
                      title: "Safety Compliance",
                      desc: "Follow all safety guidelines, instructions from guides, and use provided safety equipment properly.",
                    },
                    {
                      icon: Users,
                      title: "Respectful Behavior",
                      desc: "Treat guides, staff, other travelers, and local communities with respect and courtesy.",
                    },
                    {
                      icon: FileText,
                      title: "Environmental Care",
                      desc: "Protect wildlife and ecosystems by following Leave No Trace principles and local conservation rules.",
                    },
                    {
                      icon: AlertTriangle,
                      title: "Physical Fitness",
                      desc: "Ensure you meet the physical requirements for your chosen tour and disclose any health concerns.",
                    },
                    {
                      icon: Scale,
                      title: "Legal Compliance",
                      desc: "Comply with all local laws, customs, and regulations during your safari or trek.",
                    },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-primary-300 hover:shadow-md"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                            <IconComponent className="h-5 w-5 text-primary-600" />
                          </div>
                          <h4 className="font-bold text-primary-700">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-sm text-text-light">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 5 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="500">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-warning-500 shadow-lg">
                    <AlertTriangle className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Limitation of Liability
                  </h3>
                </div>

                <div className="mb-6 rounded-xl border border-warning-200 bg-gradient-to-br from-warning-50 to-white p-6">
                  <p className="mb-4 text-base leading-relaxed text-text-light">
                    While we take every precaution to ensure your safety, safari
                    and trekking activities involve inherent risks. By
                    participating, you acknowledge these risks and agree to the
                    following limitations:
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Personal Injury or Accidents",
                      desc: "We are not liable for injuries, accidents, or medical emergencies during tours. Comprehensive travel insurance is strongly recommended.",
                    },
                    {
                      title: "Lost or Stolen Property",
                      desc: "We are not responsible for loss, theft, or damage to personal belongings. Secure your valuables and consider travel insurance.",
                    },
                    {
                      title: "Travel Delays & Disruptions",
                      desc: "We cannot be held liable for delays or cancellations due to weather, natural disasters, strikes, political unrest, or other force majeure events.",
                    },
                    {
                      title: "Third-Party Services",
                      desc: "We work with trusted partners but are not liable for the actions, omissions, or failures of third-party service providers.",
                    },
                    {
                      title: "Wildlife Encounters",
                      desc: "Wildlife interactions are unpredictable. We cannot guarantee sightings or be liable for animal behavior during safaris.",
                    },
                    {
                      title: "Medical Conditions",
                      desc: "You are responsible for disclosing all relevant medical conditions. We are not liable for health issues arising from undisclosed conditions.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-neutral-200 bg-white p-5"
                    >
                      <h4 className="mb-2 flex items-center gap-2 font-bold text-error-700">
                        <XCircle className="h-4 w-4" />
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-light">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border-2 border-primary-200 bg-primary-50 p-5">
                  <h4 className="mb-2 font-bold text-primary-800">
                    Maximum Liability
                  </h4>
                  <p className="text-sm text-text-light">
                    Our total liability for any claims arising from your booking
                    is limited to the total amount you paid for the specific
                    tour or service.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="600">
                <div className="mb-6 flex items-center gap-4">
                  <div className="to-sunshine-400 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-600 shadow-lg">
                    <Copyright className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Intellectual Property
                  </h3>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                  <p className="mb-4 text-base leading-relaxed text-text-light">
                    All content on our platform, including but not limited to
                    text, graphics, logos, images, videos, audio clips,
                    software, and data compilations, is the exclusive property
                    of Zanzi Trekking & Safaris or our licensors.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <Ban className="mt-1 h-4 w-4 flex-shrink-0 text-error-500" />
                      <p className="text-text-light">
                        You may not copy, reproduce, distribute, modify, or
                        create derivative works without written permission
                      </p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Ban className="mt-1 h-4 w-4 flex-shrink-0 text-error-500" />
                      <p className="text-text-light">
                        Unauthorized use of our trademarks, logos, or branding
                        is strictly prohibited
                      </p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Ban className="mt-1 h-4 w-4 flex-shrink-0 text-error-500" />
                      <p className="text-text-light">
                        Photos and videos taken during tours remain your
                        property but may be used by us with your consent for
                        marketing
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="700">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 shadow-lg">
                    <Scale className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Governing Law & Disputes
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="to-background-nature rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-6">
                    <h4 className="mb-3 font-bold text-primary-700">
                      Governing Law
                    </h4>
                    <p className="text-sm leading-relaxed text-text-light">
                      These Terms of Service are governed by and construed in
                      accordance with the laws of the United Republic of
                      Tanzania. Any legal action or proceeding arising from
                      these terms shall be brought exclusively in the courts of
                      Zanzibar, Tanzania.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-6">
                    <h4 className="mb-3 font-bold text-primary-700">
                      Dispute Resolution
                    </h4>
                    <p className="mb-4 text-sm leading-relaxed text-text-light">
                      In the event of any dispute, we encourage the following
                      resolution process:
                    </p>
                    <div className="space-y-3">
                      {[
                        "Contact our customer service team first to resolve the issue informally",
                        "If unresolved, submit a formal written complaint to legal@zanzitrekking.com",
                        "We will respond within 15 business days with a proposed resolution",
                        "If still unresolved, disputes may be escalated to mediation or legal proceedings",
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                            {index + 1}
                          </div>
                          <p className="text-sm text-text-light">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 8 */}
              <div data-aos="fade-up" data-aos-delay="800">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 shadow-lg">
                    <Gavel className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Additional Terms
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Modification Rights",
                      desc: "We reserve the right to modify these terms at any time. Changes are effective immediately upon posting.",
                    },
                    {
                      title: "Severability",
                      desc: "If any provision is found unenforceable, remaining terms continue in full force.",
                    },
                    {
                      title: "Waiver",
                      desc: "Failure to enforce any provision does not constitute a waiver of that right.",
                    },
                    {
                      title: "Entire Agreement",
                      desc: "These terms constitute the entire agreement between you and Zanzi Trekking & Safaris.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-neutral-200 bg-white p-5"
                    >
                      <h4 className="mb-2 font-bold text-primary-700">
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div
                className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 text-center shadow-xl lg:p-10"
                data-aos="fade-up"
                data-aos-delay="900"
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-sm">
                  <Mail className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Legal Inquiries
                  </span>
                </div>

                <h3 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                  Questions About These Terms?
                </h3>

                <p className="mx-auto mb-6 max-w-2xl text-base text-white/90">
                  For questions about these Terms of Service or legal matters,
                  our team is available to assist you.
                </p>

                <a
                  href="mailto:legal@zanzitrekking.com"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-lg"
                >
                  legal@zanzitrekking.com
                </a>

                <p className="mt-6 text-sm text-white/70">
                  We respond to all legal inquiries within 30 business days.
                </p>
              </div>

              {/* Updates Section */}
              <div
                className="from-background-nature to-background-sunset mt-8 rounded-xl border border-neutral-200 bg-gradient-to-br p-6 text-center"
                data-aos="fade-up"
                data-aos-delay="1000"
              >
                <h3 className="mb-3 text-lg font-bold text-primary-800">
                  Terms Updates
                </h3>
                <p className="text-sm leading-relaxed text-text-light">
                  We may update these terms from time to time. We will notify
                  you of significant changes by email or through our website at
                  least 30 days before they take effect. Your continued use of
                  our services after changes become effective constitutes
                  acceptance of the updated terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
