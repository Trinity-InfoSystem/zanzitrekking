import { useEffect, useRef } from "react";
import { Award, Globe, Lock, Shield, Sparkles, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CertificationsSection = () => {
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);
  const cardsRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const benefitsElement = benefitsRef.current;
    const ctaElement = ctaRef.current;
    const cardsElement = cardsRef.current;
    const observer = observerRef.current;

    if (benefitsElement) observer.observe(benefitsElement);
    if (ctaElement) observer.observe(ctaElement);
    if (cardsElement) observer.observe(cardsElement);

    return () => {
      if (observer) {
        if (benefitsElement) observer.unobserve(benefitsElement);
        if (ctaElement) observer.unobserve(ctaElement);
        if (cardsElement) observer.unobserve(cardsElement);
      }
    };
  }, []);

  const benefits = [
    {
      icon: Award,
      title: "Elite Standards",
      text: "We're among the top 3% of Kilimanjaro operators meeting KPAP's rigorous ethical standards",
    },
    {
      icon: Users,
      title: "Fair Treatment",
      text: "Our porters receive fair wages, proper equipment, and dignified working conditions on every climb",
    },
    {
      icon: Shield,
      title: "Safety First",
      text: "TATO membership ensures we meet all licensing, insurance, and safety requirements",
    },
    {
      icon: Sparkles,
      title: "Quality Experience",
      text: "Well-treated crews deliver smoother, more reliable, and more enjoyable expeditions",
    },
    {
      icon: Globe,
      title: "Responsible Tourism",
      text: "Your adventure supports local communities and protects Tanzania's natural heritage",
    },
    {
      icon: Lock,
      title: "Trust & Accountability",
      text: "Legally registered, transparent operations with full compliance and professional service",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white py-16 lg:py-24">
      {/* Subtle background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute right-0 top-2/3 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2.5 shadow-sm">
            <Award className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Certified Excellence
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl xl:text-6xl">
            Certified Excellence in
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Ethical Tourism
            </span>
          </h1>

          {/* Logo Display */}
          <div className="mx-auto mb-8 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary-400/20 to-primary-600/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-xl lg:p-10">
                <img
                  src="https://zanzisafaris.com/wp-content/uploads/2026/01/kapa-logo.jpeg"
                  alt="KPAP - Kilimanjaro Porters Assistance Project"
                  className="h-20 w-auto object-contain lg:h-24"
                />
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-xl lg:p-10">
                <img
                  src="https://zanzisafaris.com/wp-content/uploads/2026/01/tato-logo.jpeg"
                  alt="TATO - Tanzania Association of Tour Operators"
                  className="h-20 w-auto object-contain lg:h-24"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

          {/* Description */}
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-600 lg:text-xl">
            Officially recognized by KPAP and registered with TATO — your guarantee of ethical, safe, and professionally managed adventures in Tanzania.
          </p>
        </div>

        {/* Certification Cards */}
        <div ref={cardsRef} className="scroll-reveal mb-16 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* KPAP Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-2xl">
            {/* Card Header */}
            <div className="relative border-b-4 border-primary-600 bg-gradient-to-br from-primary-50/50 via-white to-white p-8 lg:p-10">
              <div className="mb-6">
                <img
                  className="h-28 w-auto object-contain lg:h-32"
                  src="https://zanzisafaris.com/wp-content/uploads/2026/01/kapa-logo.jpeg"
                  alt="KPAP Logo"
                />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-primary-900 lg:text-4xl">
                KPAP Partner
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary-700" />
                <span className="text-sm font-semibold text-primary-700">
                  Top 3% Worldwide
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-5 p-8 text-neutral-700 lg:p-10">
              {/* Highlight Box */}
              <div className="rounded-2xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent p-6">
                <p className="text-base font-medium leading-relaxed lg:text-lg">
                  One of only <strong className="font-bold text-primary-700">66 local Tanzanian operators</strong> out of <strong className="font-bold text-primary-700">2,100+ on Kilimanjaro</strong> and <strong className="font-bold text-primary-700">168 worldwide</strong> recognized by KPAP.
                </p>
              </div>

              {/* Stats Bar */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-center shadow-md">
                <p className="text-base font-semibold text-white lg:text-lg">
                  <span className="font-bold">66</span> local operators • <span className="font-bold">168</span> worldwide • <span className="font-bold">2,100+</span> total
                </p>
              </div>

              {/* Content Paragraphs */}
              <div className="space-y-4 text-base leading-relaxed lg:text-lg">
                <p>
                  This status means we commit to <strong className="font-semibold text-primary-700">the highest standards for porter welfare</strong>: fair wages, proper equipment, weight limits, adequate food and shelter, and transparent tipping.
                </p>

                <p>
                  All standards are <strong className="font-semibold text-primary-700">independently monitored by KPAP</strong> on every climb, ensuring <strong className="font-semibold text-primary-700">safer, better-organized, and higher-quality expeditions</strong>.
                </p>

                <div className="rounded-xl bg-primary-50 p-5">
                  <p className="font-medium text-primary-900">
                    <strong>For You:</strong> A well-treated, motivated crew delivers a smoother, more reliable, and more enjoyable Kilimanjaro experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TATO Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-2xl">
            {/* Card Header */}
            <div className="relative border-b-4 border-blue-600 bg-gradient-to-br from-blue-50/50 via-white to-white p-8 lg:p-10">
              <div className="mb-6">
                <img
                  className="h-28 w-auto object-contain lg:h-32"
                  src="https://zanzisafaris.com/wp-content/uploads/2026/01/tato-logo.jpeg"
                  alt="TATO Logo"
                />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-primary-900 lg:text-4xl">
                TATO Member
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
                <span className="text-sm font-semibold text-blue-700">
                  Officially Registered
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-5 p-8 text-neutral-700 lg:p-10">
              {/* Highlight Box */}
              <div className="rounded-2xl border-l-4 border-primary-500 bg-gradient-to-r from-primary-50 to-transparent p-6">
                <p className="text-base font-medium leading-relaxed lg:text-lg">
                  Registered member of <strong className="font-bold text-primary-700">TATO</strong> — Tanzania's official association representing professional tour operators.
                </p>
              </div>

              {/* Content Paragraphs */}
              <div className="space-y-4 text-base leading-relaxed lg:text-lg">
                <p>
                  Membership confirms we operate <strong className="font-semibold text-primary-700">legally, transparently, and in full compliance</strong> with national tourism regulations, licensing, insurance, safety standards, and ethical practices.
                </p>

                <p>
                  For our guests, this guarantees <strong className="font-semibold text-primary-700">reliability, accountability, and professional service</strong> from first inquiry to journey's end.
                </p>

                <p>
                  For Tanzania, it means supporting <strong className="font-semibold text-primary-700">responsible tourism that benefits local communities and protects natural heritage</strong>.
                </p>

                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="font-medium text-primary-900">
                    <strong>Choose Wisely:</strong> Book with a trusted, recognized, locally-rooted operator — not an unregulated middleman.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div ref={benefitsRef} className="scroll-reveal mb-16">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary-900 lg:text-4xl xl:text-5xl">
              What This Means For You
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Real benefits that make your adventure safer, more ethical, and more rewarding
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-lg ring-1 ring-neutral-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:p-8"
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Content */}
                  <div className="relative">
                    <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 p-3">
                      <Icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-primary-900">
                      {benefit.title}
                    </h3>
                    <p className="leading-relaxed text-neutral-600">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div
          ref={ctaRef}
          className="scroll-reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-10 text-center shadow-2xl lg:p-16"
        >
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-0 h-64 w-64 -translate-y-32 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 translate-y-32 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Join Hundreds of Satisfied Adventurers
              </span>
            </div>

            {/* Heading */}
            <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl xl:text-5xl">
              Travel With Purpose.
              <br />
              Choose Responsibly.
            </h2>

            {/* Description */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/90 lg:text-xl">
              Experience Kilimanjaro with a certified, trusted operator committed to ethical tourism without compromising on quality, safety, or professionalism.
            </p>

            {/* Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-bold text-primary-900 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-neutral-50 hover:shadow-2xl lg:px-10 lg:py-5 lg:text-lg"
              >
                Book Your Adventure
                <Award className="h-5 w-5" />
              </Link>
              <a
                href="https://mountainexplorers.org/partnership-for-responsible-travel/climb-with-a-partner-for-responsible-travel-company/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-9 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-primary-900 lg:px-10 lg:py-5 lg:text-lg"
              >
                Learn More About KPAP
                <Shield className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scroll-reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      {/* Section divider */}
      <div className="absolute bottom-0 left-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

export default CertificationsSection;
