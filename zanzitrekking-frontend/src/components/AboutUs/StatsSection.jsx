"use client";

import {
  Award,
  Briefcase,
  Globe,
  Heart,
  MapPin,
  Mountain,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      value: "15+",
      label: "Years Experience",
      icon: Briefcase,
      color: "primary",
      gradient: "from-primary-500 to-primary-600",
      description: "of expertise in Tanzania safaris",
    },
    {
      value: "25K+",
      label: "Happy Travelers",
      icon: Users,
      color: "secondary",
      gradient: "from-secondary-500 to-secondary-600",
      description: "adventurers who trust us",
    },
    {
      value: "150+",
      label: "Destinations",
      icon: MapPin,
      color: "success",
      gradient: "from-success-500 to-success-600",
      description: "across Tanzania & Zanzibar",
    },
    {
      value: "4.9★",
      label: "Average Rating",
      icon: Star,
      color: "accent",
      gradient: "from-accent-500 to-accent-600",
      description: "from thousands of reviews",
    },
    {
      value: "100%",
      label: "Satisfaction",
      icon: ThumbsUp,
      color: "sunshine",
      gradient: "from-sunshine-400 to-sunshine-500",
      description: "guaranteed or money back",
    },
    {
      value: "50+",
      label: "Awards Won",
      icon: Award,
      color: "info",
      gradient: "from-info-500 to-info-600",
      description: "industry recognition",
    },
  ];

  return (
    <section className="via-sunset-50 relative overflow-hidden bg-gradient-to-br from-background to-background py-20">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5" />

        {/* Floating elements */}
        <div className="absolute inset-0 opacity-5">
          {[
            {
              Icon: Mountain,
              position: "left-10 top-20",
              size: "h-32 w-32",
              delay: "0s",
            },
            {
              Icon: Globe,
              position: "right-20 top-40",
              size: "h-24 w-24",
              delay: "1s",
            },
            {
              Icon: Heart,
              position: "left-1/4 bottom-40",
              size: "h-20 w-20",
              delay: "2s",
            },
            {
              Icon: Sparkles,
              position: "right-1/3 bottom-20",
              size: "h-28 w-28",
              delay: "1.5s",
            },
          ].map(({ Icon, position, size, delay }, idx) => (
            <Icon
              key={idx}
              className={`absolute ${position} ${size} animate-float text-secondary`}
              style={{
                animationDelay: delay,
                animationDuration: `${5 + idx * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute left-1/4 top-8 h-20 w-20 animate-pulse rounded-full bg-secondary/20 blur-2xl"></div>
        <div
          className="absolute bottom-8 right-1/4 h-24 w-24 animate-pulse rounded-full bg-accent/15 blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 px-4 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Section Header */}
          <div
            className="mx-auto mb-16 max-w-4xl text-center"
            data-aos="fade-up"
          >
            {/* Premium badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border-2 border-secondary/30 bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20 px-8 py-4 text-sm font-bold text-primary shadow-large backdrop-blur-md">
              <div className="relative">
                <TrendingUp className="h-5 w-5 animate-pulse text-secondary" />
                <div className="absolute inset-0 animate-ping">
                  <TrendingUp className="h-5 w-5 text-secondary opacity-30" />
                </div>
              </div>
              <span className="gradient-text-tropical">OUR ACHIEVEMENTS</span>
              <Award className="h-5 w-5 animate-bounce text-accent" />
            </div>

            <h2 className="mb-8 text-5xl font-black text-primary sm:text-6xl lg:text-7xl">
              <span className="relative">
                <span className="gradient-text-forest">Numbers That</span>
                <br />
                <span className="gradient-text-tropical">Speak Volumes</span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-secondary to-accent opacity-60"></div>
              </span>
            </h2>

            <p className="text-xl font-medium leading-relaxed text-text-light">
              Our track record speaks for itself. Here are the numbers that
              showcase our commitment to excellence.
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} index={index} />
            ))}
          </div>

          {/* Bottom Trust Indicators */}
          <div className="mt-16" data-aos="fade-up" data-aos-delay="300">
            <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-background-paper via-neutral-50 to-background-paper p-8 shadow-nature-medium">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {[
                  {
                    icon: Star,
                    label: "TripAdvisor",
                    value: "4.9/5",
                    color: "text-success",
                  },
                  {
                    icon: Award,
                    label: "Safari Awards",
                    value: "Best 2024",
                    color: "text-accent",
                  },
                  {
                    icon: Users,
                    label: "Trusted By",
                    value: "25K+",
                    color: "text-secondary",
                  },
                  {
                    icon: Globe,
                    label: "Countries",
                    value: "50+",
                    color: "text-primary",
                  },
                ].map((trust, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 ${trust.color}`}
                    >
                      <trust.icon className="h-6 w-6" />
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {trust.value}
                    </div>
                    <div className="text-sm font-medium text-text-lighter">
                      {trust.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  description,
  gradient,
  index,
}) => (
  <div
    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-paper to-neutral-50 p-8 shadow-nature-soft transition-all duration-500 hover:scale-105 hover:shadow-nature-large"
    data-aos="fade-up"
    data-aos-delay={index * 100}
  >
    {/* Background gradient on hover */}
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
    />

    {/* Content */}
    <div className="relative z-10 text-center">
      {/* Icon container */}
      <div
        className={`relative mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-medium transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}
      >
        <Icon className="h-10 w-10" />
        <div className="absolute inset-0 animate-pulse rounded-3xl bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
      </div>

      {/* Value */}
      <div className="mb-2 text-5xl font-black text-primary transition-all duration-300 group-hover:scale-110">
        {value}
      </div>

      {/* Label */}
      <div className="mb-3 text-lg font-bold text-primary transition-colors duration-300 group-hover:text-secondary">
        {label}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-text-lighter transition-colors duration-300 group-hover:text-text">
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
