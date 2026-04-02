"use client";
import { useEffect } from "react";
import {
  BarChart3,
  CheckCircle,
  Cookie,
  Globe,
  Info,
  Mail,
  Settings,
  Shield,
  Target,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const CookiesPolicy = () => {
  useEffect(() => {
    AOS.init({
      duration: 400,
      once: true,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO />
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50/30 to-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
              <Cookie className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Privacy & Cookies
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-primary-800 lg:text-5xl">
              Cookies Policy
            </h1>

            <p className="mx-auto mb-6 max-w-2xl text-base text-text-light lg:text-lg">
              Learn how we use cookies to enhance your browsing experience and
              provide personalized services on our platform.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-text-light">
              <span>Last Updated:</span>
              <time className="font-medium text-primary-700">
                {new Date("2025-06-20").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-4xl">
            {/* What Are Cookies */}
            <div className="mb-12" data-aos="fade-up">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Cookie className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800">
                  What Are Cookies?
                </h2>
              </div>
              <p className="leading-relaxed text-text-light">
                Cookies are small text files that are placed on your device when
                you visit our website. They help us improve your browsing
                experience by remembering your preferences, analyzing site
                traffic, and providing personalized content.
              </p>
            </div>

            {/* How We Use Cookies */}
            <div className="mb-12" data-aos="fade-up">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50">
                  <Settings className="h-6 w-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800">
                  How We Use Cookies
                </h2>
              </div>

              <div className="space-y-4">
                <CookieTypeCard
                  icon={Shield}
                  title="Essential Cookies"
                  description="Necessary for the website to function properly, including login functionality, booking forms, and security features."
                  color="primary"
                />
                <CookieTypeCard
                  icon={BarChart3}
                  title="Analytics Cookies"
                  description="Help us understand how visitors interact with our website through tools like Google Analytics, allowing us to improve our services."
                  color="secondary"
                />
                <CookieTypeCard
                  icon={Target}
                  title="Marketing Cookies"
                  description="Used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns through platforms like Facebook Pixel and Google Ads."
                  color="accent"
                />
                <CookieTypeCard
                  icon={Globe}
                  title="Preference Cookies"
                  description="Remember your settings and preferences, such as language, currency, and display options, to provide a customized experience."
                  color="primary"
                />
              </div>
            </div>

            {/* Managing Cookies */}
            <div className="mb-12" data-aos="fade-up">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50">
                  <Settings className="h-6 w-6 text-accent-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800">
                  Managing Cookies
                </h2>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                <p className="mb-4 leading-relaxed text-text-light">
                  You have the right to control and manage cookies. Most web
                  browsers allow you to:
                </p>
                <ul className="space-y-2 text-text-light">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-primary-600" />
                    <span>View what cookies are stored and delete them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-primary-600" />
                    <span>Block third-party cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-primary-600" />
                    <span>Block all cookies from specific websites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-primary-600" />
                    <span>Delete all cookies when you close your browser</span>
                  </li>
                </ul>
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent-50 p-4">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-600" />
                  <p className="text-sm text-text">
                    Please note that disabling cookies may affect the
                    functionality of our website and limit your access to
                    certain features.
                  </p>
                </div>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className="mb-12" data-aos="fade-up">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800">
                  Third-Party Cookies
                </h2>
              </div>
              <p className="mb-4 leading-relaxed text-text-light">
                We work with trusted third-party service providers who may also
                set cookies on your device:
              </p>
              <div className="space-y-3">
                <ThirdPartyItem
                  name="Google Analytics"
                  purpose="Website traffic analysis and user behavior insights"
                />
                <ThirdPartyItem
                  name="Facebook Pixel"
                  purpose="Ad targeting and conversion tracking"
                />
                <ThirdPartyItem
                  name="Payment Processors (Stripe/PayPal)"
                  purpose="Secure payment processing and fraud prevention"
                />
              </div>
            </div>

            {/* Your Consent */}
            <div className="mb-12" data-aos="fade-up">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50">
                  <CheckCircle className="h-6 w-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800">
                  Your Consent
                </h2>
              </div>
              <p className="leading-relaxed text-text-light">
                By continuing to use our website, you consent to our use of
                cookies as described in this policy. You can manage your cookie
                preferences at any time through your browser settings or by
                contacting us directly.
              </p>
            </div>
            {/* Contact Section */}
            <div
              className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-accent-50 p-8"
              data-aos="fade-up"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-800">
                    Have Questions?
                  </h3>
                  <p className="text-sm text-text-light">
                    Contact us about our cookie policy
                  </p>
                </div>
              </div>
              <p className="mb-4 text-text-light">
                For questions or concerns about our cookie usage, please contact
                us at:
              </p>

              <a
                href="mailto:privacy@zanzitrekking.com"
                className="inline-flex items-center gap-2 text-lg font-semibold text-primary-700 transition-colors hover:text-primary-800"
              >
                privacy@zanzitrekking.com
              </a>
              <p className="mt-4 text-sm text-text-light">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
            {/* Policy Updates */}
            <div
              className="mt-8 rounded-xl border border-neutral-200 bg-white p-6"
              data-aos="fade-up"
            >
              <h3 className="mb-2 font-semibold text-primary-800">
                Policy Updates
              </h3>
              <p className="text-sm leading-relaxed text-text-light">
                We may update this cookie policy from time to time to reflect
                changes in our practices or for legal reasons. We will notify
                you of any significant changes by email or through a notice on
                our website. Your continued use of our services after such
                changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const CookieTypeCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    primary: "border-primary-200 bg-primary-50",
    secondary: "border-secondary-200 bg-secondary-50",
    accent: "border-accent-200 bg-accent-50",
  };

  const iconColorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    accent: "text-accent-600",
  };

  return (
    <div
      className={`rounded-xl border ${colorClasses[color]} p-6 transition-all hover:shadow-soft`}
    >
      <div className="mb-3 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
        <h3 className="font-semibold text-primary-800">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-text-light">{description}</p>
    </div>
  );
};

const ThirdPartyItem = ({ name, purpose }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-600" />
      <div className="flex-1">
        <p className="font-medium text-text">{name}</p>
        <p className="mt-1 text-sm text-text-light">{purpose}</p>
      </div>
    </div>
  );
};

export default CookiesPolicy;
