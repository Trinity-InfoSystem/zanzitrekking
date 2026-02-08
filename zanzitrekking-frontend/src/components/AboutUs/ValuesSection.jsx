"use client";

import {
  Award,
  Compass,
  Globe,
  Heart,
  Leaf,
  Mountain,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export const ValuesSection = () => {
  const values = [
    {
      title: "Sustainable Tourism",
      description:
        "We are committed to preserving Tanzania's natural beauty and supporting local communities through responsible travel practices.",
      icon: Leaf,
      color: "success",
      gradient: "from-success-500 to-success-600",
      bgGradient: "from-success-50 to-success-100",
    },
    {
      title: "Expert Guides",
      description:
        "Our knowledgeable guides provide insights and ensure safe, memorable adventures with years of local expertise.",
      icon: Compass,
      color: "primary",
      gradient: "from-primary-500 to-primary-600",
      bgGradient: "from-primary-50 to-primary-100",
    },
    {
      title: "Personalized Experience",
      description:
        "We tailor each safari to match your interests, preferences, and travel style for truly unique adventures.",
      icon: Sparkles,
      color: "secondary",
      gradient: "from-secondary-500 to-secondary-600",
      bgGradient: "from-secondary-50 to-secondary-100",
    },
    {
      title: "Community Support",
      description:
        "We work closely with local communities to ensure our adventures benefit everyone and preserve cultural heritage.",
      icon: Heart,
      color: "accent",
      gradient: "from-accent-500 to-accent-600",
      bgGradient: "from-accent-50 to-accent-100",
    },
    {
      title: "Safety First",
      description:
        "Your safety is our top priority with comprehensive safety protocols and experienced wilderness first aid certified guides.",
      icon: Shield,
      color: "info",
      gradient: "from-info-500 to-info-600",
      bgGradient: "from-info-50 to-info-100",
    },
    {
      title: "Award Winning",
      description:
        "Recognized for excellence in safari experiences with multiple industry awards and thousands of satisfied travelers.",
      icon: Award,
      color: "sunshine",
      gradient: "from-sunshine-400 to-sunshine-500",
      bgGradient: "from-sunshine-50 to-sunshine-100",
    },
  ];

  return (
    <section className="via-nature-50 relative overflow-hidden bg-gradient-to-br from-background to-background py-20">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="from-primary/3 to-secondary/3 absolute inset-0 bg-gradient-to-br via-transparent" />

        {/* Floating elements */}
        <div className="absolute inset-0 opacity-5">
          {[
            {
              Icon: Mountain,
              position: "left-10 top-20",
              size: "h-24 w-24",
              delay: "0s",
            },
            {
              Icon: Globe,
              position: "right-20 top-40",
              size: "h-20 w-20",
              delay: "1s",
            },
            {
              Icon: Star,
              position: "left-1/3 bottom-20",
              size: "h-16 w-16",
              delay: "2s",
            },
            {
              Icon: Users,
              position: "right-1/4 bottom-40",
              size: "h-28 w-28",
              delay: "1.5s",
            },
          ].map(({ Icon, position, size, delay }, idx) => (
            <Icon
              key={idx}
              className={`absolute ${position} ${size} animate-float text-primary`}
              style={{
                animationDelay: delay,
                animationDuration: `${6 + idx * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Section Header */}
          <div
            className="mx-auto mb-16 max-w-4xl text-center"
            data-aos="fade-up"
          >
            {/* Premium badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 px-8 py-4 text-sm font-bold text-primary shadow-large backdrop-blur-md">
              <div className="relative">
                <Award className="h-5 w-5 animate-pulse text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Award className="h-5 w-5 text-primary opacity-30" />
                </div>
              </div>
              <span className="gradient-text-forest">OUR CORE VALUES</span>
              <Star className="h-5 w-5 animate-bounce text-success" />
            </div>

            <h2 className="mb-8 text-5xl font-black text-primary sm:text-6xl lg:text-7xl">
              <span className="relative">
                <span className="gradient-text-forest">What Drives</span>
                <br />
                <span className="gradient-text-tropical">Our Mission</span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-60"></div>
              </span>
            </h2>

            <p className="text-xl font-medium leading-relaxed text-text-light">
              We are guided by our commitment to excellence, sustainability, and
              creating meaningful experiences that connect you with
              Tanzania&apos;s natural wonders.
            </p>
          </div>

          {/* Enhanced Values Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} index={index} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div
            className="mt-16 text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-8 shadow-nature-large">
              <h3 className="mb-4 text-3xl font-black text-white">
                Ready to Experience Our Values?
              </h3>
              <p className="mb-6 text-lg text-white/90">
                Join thousands of travelers who have experienced our commitment
                to excellence.
              </p>
              <button className="group rounded-2xl border-2 border-secondary bg-secondary px-8 py-4 text-lg font-bold text-white shadow-coral-medium transition-all hover:scale-105 hover:bg-white hover:text-secondary hover:shadow-coral-large">
                <span className="flex items-center gap-3">
                  Start Your Adventure
                  <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(-4px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

const ValueCard = ({
  icon: Icon,
  title,
  description,
  gradient,
  bgGradient,
  index,
}) => (
  <div
    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-paper to-neutral-50 p-8 shadow-nature-soft transition-all duration-500 hover:scale-105 hover:shadow-nature-large"
    data-aos="fade-up"
    data-aos-delay={index * 100}
  >
    {/* Background gradient */}
    <div
      className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
    />

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center text-center">
      {/* Icon container */}
      <div
        className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-medium transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}
      >
        <Icon className="h-10 w-10" />
        <div className="absolute inset-0 animate-pulse rounded-3xl bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
      </div>

      {/* Title */}
      <h3 className="mb-4 text-2xl font-black text-primary transition-all duration-300 group-hover:scale-105">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base leading-relaxed text-text-light transition-colors duration-300 group-hover:text-text">
        {description}
      </p>

      {/* Hover effect line */}
      <div
        className={`absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 group-hover:w-16`}
      />
    </div>

    {/* Decorative corner elements */}
    <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-gradient-to-r from-secondary/30 to-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="absolute bottom-4 left-4 h-1 w-1 rounded-full bg-gradient-to-r from-primary/30 to-success/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </div>
);
