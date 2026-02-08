"use client";

import {
  ArrowRight,
  Award,
  Compass,
  Eye,
  Globe,
  Heart,
  Mountain,
  Star,
  Target,
  TreePine,
  Users,
} from "lucide-react";

export const MissionVisionSection = () => {
  const missionPoints = [
    {
      icon: Globe,
      title: "Preserve Nature",
      description:
        "Protect Tanzania&apos;s wildlife and ecosystems for future generations",
    },
    {
      icon: Users,
      title: "Empower Communities",
      description:
        "Support local communities through responsible tourism practices",
    },
    {
      icon: Heart,
      title: "Create Memories",
      description: "Deliver unforgettable experiences that last a lifetime",
    },
    {
      icon: Award,
      title: "Excellence Always",
      description: "Maintain the highest standards in everything we do",
    },
  ];

  const visionPoints = [
    {
      icon: Mountain,
      title: "Sustainable Future",
      description: "Leading the way in eco-friendly safari experiences",
    },
    {
      icon: TreePine,
      title: "Global Recognition",
      description: "Becoming the world&apos;s most trusted safari operator",
    },
    {
      icon: Compass,
      title: "Innovation",
      description: "Pioneering new ways to experience Africa&apos;s wilderness",
    },
    {
      icon: Star,
      title: "Inspiration",
      description: "Inspiring others to protect and cherish our planet",
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
              size: "h-32 w-32",
              delay: "0s",
            },
            {
              Icon: TreePine,
              position: "right-20 top-40",
              size: "h-24 w-24",
              delay: "1s",
            },
            {
              Icon: Globe,
              position: "left-1/4 bottom-40",
              size: "h-20 w-20",
              delay: "2s",
            },
            {
              Icon: Star,
              position: "right-1/3 bottom-20",
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

        {/* Gradient orbs */}
        <div className="absolute left-1/4 top-8 h-20 w-20 animate-pulse rounded-full bg-primary/20 blur-2xl"></div>
        <div
          className="absolute bottom-8 right-1/4 h-24 w-24 animate-pulse rounded-full bg-secondary/15 blur-2xl"
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
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 px-8 py-4 text-sm font-bold text-primary shadow-large backdrop-blur-md">
              <div className="relative">
                <Target className="h-5 w-5 animate-pulse text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Target className="h-5 w-5 text-primary opacity-30" />
                </div>
              </div>
              <span className="gradient-text-forest">OUR PURPOSE</span>
              <Eye className="h-5 w-5 animate-bounce text-success" />
            </div>

            <h2 className="mb-8 text-5xl font-black text-primary sm:text-6xl lg:text-7xl">
              <span className="relative">
                <span className="gradient-text-forest">Mission &</span>
                <br />
                <span className="gradient-text-tropical">Vision</span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-60"></div>
              </span>
            </h2>

            <p className="text-xl font-medium leading-relaxed text-text-light">
              Our mission and vision guide everything we do, from planning your
              adventure to protecting Tanzania&apos;s natural heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Mission Section */}
            <div className="space-y-8" data-aos="fade-right">
              <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-8 shadow-nature-large">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-white shadow-medium">
                    <Target className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">
                      Our Mission
                    </h3>
                    <p className="text-white/80">What drives us every day</p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-white/90">
                  To provide exceptional safari experiences that connect
                  travelers with Tanzania&apos;s natural beauty while preserving
                  wildlife, supporting local communities, and inspiring a deeper
                  appreciation for our planet&apos;s incredible biodiversity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {missionPoints.map((point, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl bg-gradient-to-br from-background-paper to-neutral-50 p-6 shadow-nature-soft transition-all duration-500 hover:scale-105 hover:shadow-nature-medium"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-medium transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <point.icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-2 text-lg font-bold text-primary">
                      {point.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-text-light">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Section */}
            <div className="space-y-8" data-aos="fade-left">
              <div className="rounded-3xl bg-gradient-to-br from-secondary via-secondary-600 to-accent-600 p-8 shadow-coral-large">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-white shadow-medium">
                    <Eye className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">
                      Our Vision
                    </h3>
                    <p className="text-white/80">Where we&apos;re heading</p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-white/90">
                  To be the world&apos;s leading sustainable safari operator,
                  recognized for our commitment to conservation, community
                  empowerment, and creating transformative travel experiences
                  that inspire global environmental stewardship.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {visionPoints.map((point, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl bg-gradient-to-br from-background-paper to-neutral-50 p-6 shadow-nature-soft transition-all duration-500 hover:scale-105 hover:shadow-nature-medium"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-600 text-white shadow-medium transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <point.icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-2 text-lg font-bold text-primary">
                      {point.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-text-light">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            className="mt-16 text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-background-paper via-neutral-50 to-background-paper p-8 shadow-nature-medium">
              <h3 className="mb-4 text-3xl font-black text-primary">
                Join Us in Our Mission
              </h3>
              <p className="mb-6 text-lg text-text-light">
                Every safari with us contributes to conservation efforts and
                community development. Be part of something bigger than just a
                vacation.
              </p>
              <button className="group rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-8 py-4 text-lg font-bold text-white shadow-nature-medium transition-all hover:scale-105 hover:shadow-nature-large">
                <span className="flex items-center gap-3">
                  Start Your Impact Journey
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-8px) rotate(2deg);
          }
          66% {
            transform: translateY(-4px) rotate(-1deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
