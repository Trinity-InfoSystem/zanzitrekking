"use client";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CommonNinjaWidget } from "commonninja-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Camera, ChevronRight as ChevronRightIcon, Compass, Heart, Mountain, Sparkles, Star, TreePine } from "lucide-react";

const GoogleReviews = () => {
  useEffect(() => {
    AOS.init({ duration: 400, once: true, offset: 60 });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO/>
      <Header />

      {/* Hero (matching Blog/Trips) */}
      <section className="via-nature-50 relative overflow-hidden bg-gradient-to-br from-background to-background py-20">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          {/* Floating decorative elements */}
          <div className="absolute inset-0 opacity-10">
            {[
              { Icon: Mountain, position: "left-10 top-20", size: "h-32 w-32", delay: "0s" },
              { Icon: TreePine, position: "right-20 top-40", size: "h-24 w-24", delay: "0.5s" },
              { Icon: Compass, position: "left-1/4 bottom-40", size: "h-20 w-20", delay: "1s" },
              { Icon: Star, position: "right-1/3 bottom-20", size: "h-28 w-28", delay: "1.5s" },
              { Icon: Camera, position: "left-1/3 top-1/2", size: "h-16 w-16", delay: "2s" },
              { Icon: Heart, position: "right-1/4 top-1/2", size: "h-20 w-20", delay: "2.5s" },
            ].map(({ Icon, position, size, delay }, idx) => (
              <Icon
                key={idx}
                className={`absolute ${position} ${size} animate-float text-primary`}
                style={{ animationDelay: delay, animationDuration: `${4 + idx * 0.5}s` }}
              />
            ))}
          </div>

          {/* Gradient orbs */}
          <div className="absolute left-1/4 top-8 h-20 w-20 animate-pulse rounded-full bg-secondary/20 blur-2xl"></div>
          <div className="absolute bottom-8 right-1/4 h-24 w-24 animate-pulse rounded-full bg-accent/15 blur-2xl" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center" data-aos="fade-up">
              {/* Premium badge */}
              <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border-2 border-secondary/30 bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20 px-8 py-4 text-sm font-bold text-primary shadow-large backdrop-blur-md">
                <div className="relative">
                  <Compass className="h-5 w-5 animate-pulse text-secondary" />
                  <div className="absolute inset-0 animate-ping">
                    <Compass className="h-5 w-5 text-secondary opacity-30" />
                  </div>
                </div>
                <span className="gradient-text-tropical">VERIFIED REVIEWS</span>
                <Sparkles className="h-5 w-5 animate-bounce text-accent" />
              </div>

              <h1 className="mb-8 text-5xl font-black text-primary sm:text-6xl lg:text-7xl">
                <span className="relative">
                  <span className="gradient-text-forest">Google</span>
                  <span className="gradient-text-tropical"> Reviews</span>
                  <div className="absolute -bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-secondary to-accent opacity-60"></div>
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl font-medium leading-relaxed text-text-light">
                Read authentic feedback from travelers who experienced our safaris and treks.
              </p>

              {/* Breadcrumb */}
              <div className="flex items-center justify-center text-sm text-text-lighter">
                <a href="/" className="transition-colors hover:text-primary hover:underline">Home</a>
                <ChevronRightIcon className="mx-2 h-4 w-4" />
                <span className="font-medium text-primary">Google Reviews</span>
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
          .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>
      </section>

      {/* Content */}
      <section className="via-nature-50 relative overflow-hidden bg-gradient-to-br from-background to-background py-20">
        <div className="absolute inset-0">
          <div className="from-primary/3 to-secondary/3 absolute inset-0 bg-gradient-to-br via-transparent" />
        </div>
        <div className="relative z-10 px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
        <div
          className="rounded-3xl bg-gradient-to-br from-white via-background-paper to-background-nature/20 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
          data-aos="fade-up"
        >
          <div className="mb-6 flex items-center justify-center gap-3 text-text-dark">
            <Star className="h-6 w-6 text-sunshine" />
            <span className="text-xl font-semibold">What our guests say</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white/70 p-2 shadow-nature-soft">
            <CommonNinjaWidget widgetId="9f697e0f-2170-404f-82cd-b947120aa421" />
          </div>
        </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GoogleReviews;
