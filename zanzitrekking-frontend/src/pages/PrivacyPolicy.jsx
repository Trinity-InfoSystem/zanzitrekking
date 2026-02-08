"use client";
import { useEffect } from "react";
import {
  Baby,
  CheckCircle,
  Clock,
  Compass,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Mail,
  Shield,
  Users,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <div className="from-background-nature to-background-sunset min-h-screen bg-gradient-to-br via-white">
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
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                PRIVACY & SECURITY
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white lg:text-5xl">
              Privacy Policy
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              Your privacy is our priority. Learn how we protect your personal
              information at Zanzi Trekking & Safaris.
            </p>

            <div className="flex items-center justify-center gap-3 text-sm text-white/80">
              <span>Home</span>
              <span>/</span>
              <span className="font-semibold text-white">Privacy Policy</span>
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
                Privacy Policy
              </h2>
              <p className="mx-auto max-w-2xl text-base text-text-light">
                This policy explains how we collect, use, and protect your
                information at Zanzi Trekking & Safaris.
              </p>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-12">
              {/* Section 1 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Information We Collect
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  To provide exceptional safari experiences, we collect various
                  types of information when you interact with our platform.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="to-background-nature group rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-5 transition-all duration-200 hover:border-primary-300 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <Shield className="h-5 w-5 text-primary-600" />
                      </div>
                      <h4 className="text-lg font-bold text-primary-700">
                        Personal Information
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-text-light">
                      Full name, email, phone, passport details, payment info,
                      travel preferences, dietary requirements, and emergency
                      contacts.
                    </p>
                  </div>

                  <div className="to-background-nature group rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-5 transition-all duration-200 hover:border-secondary-300 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100">
                        <Eye className="h-5 w-5 text-secondary-600" />
                      </div>
                      <h4 className="text-lg font-bold text-secondary-700">
                        Usage Data
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-text-light">
                      IP address, browser type, device info, pages visited, time
                      spent, and interaction patterns with our platform.
                    </p>
                  </div>

                  <div className="to-background-sunset group rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-5 transition-all duration-200 hover:border-accent-300 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100">
                        <FileText className="h-5 w-5 text-accent-600" />
                      </div>
                      <h4 className="text-lg font-bold text-accent-700">
                        Cookies & Tracking
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-text-light">
                      We use cookies and tracking technologies to enhance your
                      experience. See our Cookie Policy for details.
                    </p>
                  </div>

                  <div className="to-background-nature group rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-5 transition-all duration-200 hover:border-teal-300 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                        <Compass className="h-5 w-5 text-teal-600" />
                      </div>
                      <h4 className="text-lg font-bold text-teal-700">
                        Location Data
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-text-light">
                      With permission, we collect location data for
                      location-based services and emergency assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="200">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 shadow-lg">
                    <Database className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    How We Use Your Data
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  We use your information to deliver exceptional safari
                  experiences and maintain the highest service standards.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      text: "Process bookings, arrange accommodations, coordinate transportation, and facilitate safari tours",
                      label: "Bookings & Services",
                    },
                    {
                      text: "Securely process payments, issue invoices, manage refunds, and maintain transaction records",
                      label: "Payment Processing",
                    },
                    {
                      text: "Respond to inquiries, resolve issues, provide trip updates, and offer personalized assistance",
                      label: "Customer Support",
                    },
                    {
                      text: "Analyze usage patterns, gather feedback, enhance user experience, and develop new features",
                      label: "Service Improvement",
                    },
                    {
                      text: "Send promotional offers, seasonal deals, new destinations, and travel inspiration (opt-out available)",
                      label: "Marketing Communications",
                    },
                    {
                      text: "Ensure traveler safety, conduct emergency communications, prevent fraud, and comply with regulations",
                      label: "Safety & Compliance",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-background-paper p-4 transition-all duration-200 hover:border-success-300 hover:bg-success-50/30"
                    >
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success-500">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold text-primary-700">
                          {item.label}
                        </p>
                        <p className="text-sm leading-relaxed text-text-light">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="300">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Data Sharing & Third Parties
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  We only share your data with trusted partners essential to
                  delivering your safari experience. We never sell your personal
                  information.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      icon: Compass,
                      title: "Safari Operators & Tour Guides",
                      desc: "To coordinate bookings, provide accurate itineraries, and ensure seamless service delivery.",
                    },
                    {
                      icon: FileText,
                      title: "Accommodation Partners",
                      desc: "Hotels and lodges receive booking details to prepare for your arrival and provide personalized service.",
                    },
                    {
                      icon: Lock,
                      title: "Payment Processors",
                      desc: "Stripe, PayPal, and secure payment gateways process transactions with PCI-DSS compliance.",
                    },
                    {
                      icon: Globe,
                      title: "Technology Partners",
                      desc: "Cloud hosting, analytics tools, and CRM platforms that help us operate and improve services.",
                    },
                    {
                      icon: Shield,
                      title: "Legal Authorities",
                      desc: "When required by law, court order, or to protect rights, prevent fraud, or ensure public safety.",
                    },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-primary-300 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                          <IconComponent className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-bold text-primary-700">
                            {item.title}
                          </h4>
                          <p className="text-sm text-text-light">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="400">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Your Privacy Rights
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  You have comprehensive rights regarding your personal
                  information. We&apos;re committed to facilitating these rights
                  promptly and transparently.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Access your data and request a copy of all personal information we hold",
                    "Correct any inaccurate or incomplete personal information",
                    "Delete your personal data, subject to legal retention requirements",
                    "Opt out of marketing emails, SMS, and promotional communications",
                    "Request data portability in a structured, commonly used format",
                    "Restrict how we use your data while we investigate concerns",
                    "Object to certain types of processing, including profiling",
                    "Withdraw consent for data processing at any time",
                  ].map((right, index) => (
                    <div
                      key={index}
                      className="to-background-nature flex items-start gap-3 rounded-lg border border-neutral-200 bg-gradient-to-br from-white p-4"
                    >
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-sm text-text-light">{right}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-sm text-text-light">
                  To exercise any of these rights, contact us at{" "}
                  <a
                    href="mailto:privacy@zanzitrekking.com"
                    className="font-semibold text-primary-600 hover:text-primary-700"
                  >
                    privacy@zanzitrekking.com
                  </a>
                  . We respond within 30 days.
                </p>
              </div>

              {/* Section 5 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="500">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Data Security Measures
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  Protecting your personal information is our top priority. We
                  implement comprehensive security measures to safeguard your
                  data.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Encryption & Secure Transmission",
                      desc: "256-bit SSL/TLS encryption for all data. Payment information encrypted using PCI-DSS compliant protocols.",
                    },
                    {
                      title: "Secure Infrastructure",
                      desc: "Enterprise firewalls, intrusion detection, DDoS protection, and 24/7 security monitoring.",
                    },
                    {
                      title: "Access Controls",
                      desc: "Multi-factor authentication, role-based access controls, and regular access audits.",
                    },
                    {
                      title: "Regular Security Audits",
                      desc: "Quarterly assessments, vulnerability testing, penetration testing, and continuous monitoring.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-neutral-200 bg-gradient-to-br from-white to-background-paper p-5"
                    >
                      <h4 className="mb-2 font-bold text-primary-700">
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="600">
                <div className="mb-6 flex items-center gap-4">
                  <div className="to-sunshine-400 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-500 shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Data Retention Policy
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  We retain your personal information only as long as necessary
                  to fulfill our services and comply with legal obligations.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      label: "Active Account Data",
                      desc: "Maintained while active and for 3 years after your last booking.",
                    },
                    {
                      label: "Transaction Records",
                      desc: "Kept for 7 years to comply with tax and financial regulations.",
                    },
                    {
                      label: "Marketing Data",
                      desc: "Retained until you opt out or request deletion.",
                    },
                    {
                      label: "Inactive Accounts",
                      desc: "After 5 years of inactivity, we may delete or anonymize your data.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-neutral-200 bg-white p-4"
                    >
                      <p className="mb-1 font-semibold text-primary-700">
                        {item.label}
                      </p>
                      <p className="text-sm text-text-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7 */}
              <div className="mb-12" data-aos="fade-up" data-aos-delay="700">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-primary-700 shadow-lg">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    International Data Transfers
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  Your data may be transferred to countries other than your own.
                  We ensure appropriate safeguards for all international
                  transfers.
                </p>

                <div className="to-background-nature rounded-xl border border-neutral-200 bg-gradient-to-br from-white p-6">
                  <p className="mb-4 text-sm leading-relaxed text-text-light">
                    Data may be processed in Tanzania, Kenya, EU, US, and other
                    countries where our service providers operate. We use
                    Standard Contractual Clauses (SCCs) and other approved
                    mechanisms to ensure protection across borders.
                  </p>
                  <p className="text-sm text-text-light">
                    All international partners maintain security measures
                    equivalent to those described in this policy.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div data-aos="fade-up" data-aos-delay="800">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                    <Baby className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 lg:text-3xl">
                    Children&apos;s Privacy
                  </h3>
                </div>

                <p className="mb-6 text-base text-text-light">
                  Our services are not intended for children under 13 (or 16 in
                  certain jurisdictions). We do not knowingly collect
                  information from children.
                </p>

                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                  <ul className="space-y-3">
                    {[
                      "Users must confirm they are of legal age when creating an account",
                      "Bookings for minors must be made by a parent or legal guardian",
                      "If we discover data from a child, we delete it immediately",
                      "Parents can request access to or deletion of their child&apos;s information",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                        <p className="text-sm text-text-light">{item}</p>
                      </li>
                    ))}
                  </ul>
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
                    Contact Our Privacy Team
                  </span>
                </div>

                <h3 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                  Questions About Your Privacy?
                </h3>

                <p className="mx-auto mb-6 max-w-2xl text-base text-white/90">
                  For privacy questions, data access requests, or concerns about
                  how we handle your information, our team is here to help.
                </p>

                <a
                  href="mailto:privacy@zanzitrekking.com"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-lg"
                >
                  privacy@zanzitrekking.com
                </a>

                <p className="mt-6 text-sm text-white/70">
                  We respond to all privacy inquiries within 30 days. For urgent
                  matters, we aim to respond within 72 hours.
                </p>
              </div>

              {/* Updates Section */}
              <div
                className="from-background-nature to-background-sunset mt-8 rounded-xl border border-neutral-200 bg-gradient-to-br p-6 text-center"
                data-aos="fade-up"
                data-aos-delay="1000"
              >
                <h3 className="mb-3 text-lg font-bold text-primary-800">
                  Policy Updates & Changes
                </h3>
                <p className="text-sm leading-relaxed text-text-light">
                  We may update this privacy policy periodically to reflect
                  changes in our practices or legal requirements. We will notify
                  you of material changes via email or website notice at least
                  30 days before they take effect. Your continued use
                  constitutes acceptance of the updated policy.
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

export default PrivacyPolicy;
