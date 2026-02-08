import {
  ArrowDown,
  Award,
  Calendar,
  MapPin,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const TripHero = ({ trip, imageName }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const formatLocation = (location) => {
    if (!location) {return "Tanzania";}

    const parts = location
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return "Tanzania";
    }

    const area = parts[0];
    const country = parts[parts.length - 1];

    if (!country || country.toLowerCase() === area.toLowerCase()) {
      return area;
    }

    return `${area}, ${country}`;
  };

  const formattedLocation = formatLocation(
    Array.isArray(trip.mainDestination)
      ? trip.mainDestination[0]?.name
      : trip.mainDestination?.name,
  );

  return (
    <div className="safari-hero relative mb-8 overflow-hidden sm:mb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .safari-hero {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .hero-badge {
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        
        .hero-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .scroll-indicator {
          animation: float 2s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .gradient-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #f8fafc 25%,
            #ffffff 50%,
            #f8fafc 75%,
            #ffffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="relative h-[300px] w-full overflow-hidden bg-neutral-900 sm:h-[380px] lg:h-[430px] xl:h-[450px]">
        {/* Image with parallax */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.2}px) scale(1.05)`,
          }}
        >
          <img
            src={imageName}
            alt={trip.mainTitle}
            className={`h-full w-full object-cover transition-all duration-1000 ${
              isLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Enhanced Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
            <div className="mx-auto max-w-7xl">
              {/* Badges */}
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
                {trip.discount > 0 && (
                  <div className="hero-badge group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2 shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">
                      {trip.discount}% OFF
                    </span>
                  </div>
                )}

                {(() => {
                  const rating = Number(trip.rating);
                  return !isNaN(rating) && rating > 0;
                })() && (
                  <div className="hero-badge inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                      {trip.rating}
                    </span>
                  </div>
                )}

                {trip.maxGroupSize && (
                  <div className="hero-badge inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">
                      Max {trip.maxGroupSize}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="mb-8 sm:mb-12">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white/90 sm:text-5xl md:text-6xl lg:text-7xl">
                  {trip.mainTitle}
                </h1>

                {trip.subTitle && (
                  <p className="max-w-3xl text-base font-medium leading-relaxed text-white/90 sm:text-lg md:text-xl lg:text-2xl">
                    {trip.subTitle}
                  </p>
                )}
              </div>

              {/* Info Cards - Enhanced */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="group flex items-center gap-3 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                      Destination
                    </div>
                    <div className="text-sm font-bold text-white sm:text-base">
                      {formattedLocation}
                    </div>
                  </div>
                </div>

                {trip.days && trip.days.length > 0 && (
                  <div className="group flex items-center gap-3 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                        Duration
                      </div>
                      <div className="text-sm font-bold text-white sm:text-base">
                        {trip.days.length}{" "}
                        {trip.days.length === 1 ? "Day" : "Days"}
                      </div>
                    </div>
                  </div>
                )}

                {trip.maxGroupSize && (
                  <div className="group flex items-center gap-3 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                        Group Size
                      </div>
                      <div className="text-sm font-bold text-white sm:text-base">
                        Up to {trip.maxGroupSize}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHero;
