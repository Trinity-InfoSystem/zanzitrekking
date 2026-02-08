"use client";

import { Link } from "react-router-dom";
import { IMAGES_URL } from "../../utils/constants";
import {
  ArrowRight,
  Award,
  ChevronRightIcon,
  Compass,
  Heart,
  Mountain,
  PlayCircle,
  Sparkles,
  Star,
  TreePine,
  Users,
} from "lucide-react";

export const AboutUsHero = ({ whoWeAre, statisticData }) => {
  // Process paragraph text
  const lines = whoWeAre?.paragraph?.split(/\r?\n/);
  const firstTwoLines = lines?.slice(0, 2).join(" ");
  const rest = lines?.slice(2).join(" ");

  return (
    <section className="via-nature-50 relative overflow-hidden bg-gradient-to-br from-background to-background py-20">
      {/* Enhanced Background with Dynamic Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 opacity-10">
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
              delay: "0.5s",
            },
            {
              Icon: Compass,
              position: "left-1/4 bottom-40",
              size: "h-20 w-20",
              delay: "1s",
            },
            {
              Icon: Star,
              position: "right-1/3 bottom-20",
              size: "h-28 w-28",
              delay: "1.5s",
            },
            {
              Icon: Award,
              position: "left-1/3 top-1/2",
              size: "h-16 w-16",
              delay: "2s",
            },
            {
              Icon: Heart,
              position: "right-1/4 top-1/2",
              size: "h-20 w-20",
              delay: "2.5s",
            },
          ].map(({ Icon, position, size, delay }, idx) => (
            <Icon
              key={idx}
              className={`absolute ${position} ${size} animate-float text-primary`}
              style={{
                animationDelay: delay,
                animationDuration: `${4 + idx * 0.5}s`,
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
          <div className="text-center" data-aos="fade-up">
            {/* Premium badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border-2 border-secondary/30 bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20 px-8 py-4 text-sm font-bold text-primary shadow-large backdrop-blur-md">
              <div className="relative">
                <Award className="h-5 w-5 animate-pulse text-secondary" />
                <div className="absolute inset-0 animate-ping">
                  <Award className="h-5 w-5 text-secondary opacity-30" />
                </div>
              </div>
              <span className="gradient-text-tropical">About Us</span>
              <Sparkles className="h-5 w-5 animate-bounce text-accent" />
            </div>

            <h1 className="mb-8 text-5xl font-black text-primary sm:text-6xl lg:text-7xl">
              <span className="relative">
                <span className="gradient-text-forest">
                  {whoWeAre?.mainTitle || "Discover Our"}
                </span>
                <br />
                <span className="gradient-text-tropical">Story</span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-secondary to-accent opacity-60"></div>
              </span>
            </h1>

            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-center text-sm text-text-lighter">
              <Link
                to="/"
                className="transition-colors hover:text-primary hover:underline"
              >
                Home
              </Link>
              <ChevronRightIcon className="mx-2 h-4 w-4" />
              <span className="font-medium text-primary">About Us</span>
            </div>

            <p className="mx-auto mb-8 max-w-3xl text-xl font-medium leading-relaxed text-text-light">
              {firstTwoLines ||
                "We are dedicated to providing exceptional safari experiences that connect you with Tanzania's natural beauty and wildlife."}
            </p>

            <p className="mx-auto mb-12 max-w-4xl text-lg leading-relaxed text-text-light">
              {rest ||
                "Our team of experienced guides and travel experts work tirelessly to create unforgettable adventures that respect local communities and preserve the environment for future generations."}
            </p>

            {/* Enhanced CTA buttons */}
            <div className="mb-12 flex flex-wrap justify-center gap-6">
              <Link
                to="/trips"
                className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-8 py-4 text-lg font-bold text-white shadow-nature-medium transition-all duration-300 hover:scale-105 hover:shadow-nature-large"
              >
                <span className="flex items-center gap-3">
                  Explore Our Trips
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                to="/contact-us"
                className="group inline-flex items-center justify-center rounded-2xl border-2 border-secondary bg-white px-8 py-4 text-lg font-bold text-secondary transition-all duration-300 hover:scale-105 hover:bg-secondary hover:text-white hover:shadow-coral-medium"
              >
                <span className="flex items-center gap-3">
                  Contact Us
                  <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
                </span>
              </Link>
            </div>

            {/* Enhanced Image Gallery */}
            <div className="mb-12" data-aos="fade-up" data-aos-delay="200">
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                {["image1", "image2", "image3"].map((img, index) => {
                  const imageName = whoWeAre[img]
                    ? IMAGES_URL + whoWeAre[img].split("/").pop()
                    : "/placeholder.svg?height=400&width=300";
                  return (
                    <div key={index} className="group">
                      <div className="relative overflow-hidden rounded-3xl shadow-nature-medium transition-all duration-700 hover:scale-105 hover:shadow-nature-large">
                        <img
                          src={imageName}
                          alt="About Us"
                          className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Hover play button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30">
                            <PlayCircle className="h-8 w-8 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8">
              {[
                {
                  icon: Users,
                  value: statisticData?.totalOrderTraveller,
                  label: "Happy Travelers",
                  color: "primary",
                },
                {
                  icon: Star,
                  value: `${statisticData?.overallRating || "4.9"  }★`,
                  label: "Average Rating",
                  color: "secondary",
                },
                {
                  icon: Award,
                  value: "15+",
                  label: "Years Experience",
                  color: "accent",
                },
                {
                  icon: Mountain,
                  value: statisticData?.totalTrips,
                  label: "Destinations",
                  color: "primary",
                },
              ].map((stat, idx) => (
                <div key={idx} className="group cursor-pointer text-center">
                  <div
                    className={`relative mb-3 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white shadow-medium transition-all duration-500 group-hover:rotate-12 group-hover:scale-125`}
                  >
                    <stat.icon className="h-7 w-7" />
                    <div className="absolute inset-0 animate-pulse rounded-3xl bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                  </div>
                  <div className="text-2xl font-black text-primary transition-all duration-300 group-hover:scale-110">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-text-lighter">
                    {stat.label}
                  </div>
                </div>
              ))}
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
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
