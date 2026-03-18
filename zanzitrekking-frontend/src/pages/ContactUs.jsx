"use client";

import { useEffect } from "react";
import ContactInfoCard from "../components/ContactUs/ContactInfoCard";
import ContactForm from "../components/ContactUs/ContactForm";
import ContactMap from "../components/ContactUs/ContactMap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 400,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-slate-50/30 to-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2">
              <MessageCircle className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                We&apos;re Here to Help
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-neutral-900 lg:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto max-w-2xl text-base text-neutral-600 lg:text-lg">
              Have questions about your next adventure? Our team is ready to
              help you plan the perfect safari or trekking experience in
              Tanzania.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative bg-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Contact Info Cards */}
            <div className="mb-16" data-aos="fade-up">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Email Card */}
                <ContactInfoCard icon={Mail} title="Email Us">
                  <a
                    href="mailto:info@zanzisafaris.com"
                    className="block transition-colors hover:text-slate-700"
                  >
                    info@zanzisafaris.com
                  </a>
                </ContactInfoCard>

                {/* Phone Card */}
                <ContactInfoCard icon={Phone} title="Call Us">
                  <a
                    href="tel:+255752777701"
                    className="block transition-colors hover:text-emerald-600"
                  >
                    +255 752 777 701
                  </a>
                  <a
                    href="tel:+779045673345"
                    className="block transition-colors hover:text-emerald-600"
                  >
                    +77 904 5673 345
                  </a>
                </ContactInfoCard>

                {/* Address Card */}
                <ContactInfoCard icon={MapPin} title="Visit Us">
                  <p>
                    Simeon Road, Arusha 23101
                    <br />
                    Tanzania, East Africa
                  </p>
                </ContactInfoCard>
              </div>
            </div>

            {/* Form and Map Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7" data-aos="fade-right">
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Fill out the form below and we&apos;ll get back to you within
                      24 hours.
                    </p>
                  </div>
                  <ContactForm />
                </div>
              </div>

              <div className="lg:col-span-5" data-aos="fade-left">
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
                    <ContactMap />
                  </div>

                  {/* Business Hours */}
                  <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                      <Clock className="h-5 w-5 text-slate-600" />
                      Business Hours
                    </h3>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-semibold text-neutral-900">
                          8:00 AM - 6:00 PM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-semibold text-neutral-900">
                          9:00 AM - 4:00 PM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-semibold text-neutral-900">
                          Closed
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-neutral-200 pt-4">
                      <p className="flex items-center gap-2 text-sm text-neutral-600">
                        <Globe className="h-4 w-4 text-indigo-600" />
                        <span>East Africa Time (EAT) - UTC+3</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div
              className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center"
              data-aos="fade-up"
            >
              <div className="mx-auto flex max-w-3xl items-center justify-center gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                    Fast Response Guaranteed
                  </h3>
                  <p className="text-sm text-neutral-600">
                    We typically respond to all inquiries within 24 hours during
                    business days. For urgent matters, please call us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
