import { useEffect, useState } from "react";
import {
  Award,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Users,
  CheckCircle2,
  Globe,
  Headphones,
  Calendar,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const WhyChooseUs = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    AOS.init({ once: true, duration: 800, offset: 60 });
  }, []);

  const advantages = [
    {
      icon: Users,
      title: "Expert Local Guides",
      description:
        "Our experienced Tanzanian guides know every trail, wildlife pattern, and hidden gem. They're not just guides—they're storytellers sharing their homeland.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Star,
      title: "Award-Winning Service",
      description:
        "Recognized by KPAP and TATO for excellence. We're among the top 3% of operators worldwide, ensuring you get the best experience possible.",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: Shield,
      title: "Safety First Always",
      description:
        "Fully licensed, insured, and certified. We follow strict safety protocols and maintain the highest standards for equipment and emergency preparedness.",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: Heart,
      title: "Ethical & Responsible",
      description:
        "Fair wages for our team, support for local communities, and sustainable practices. Your adventure makes a positive impact on Tanzania.",
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "From planning to your return home, our team is always available. Need help? We're just a call or message away, anytime, anywhere.",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Calendar,
      title: "Flexible Booking",
      description:
        "Life happens. We offer flexible booking options, easy rescheduling, and fair cancellation policies. Your peace of mind matters to us.",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      icon: MapPin,
      title: "Authentic Experiences",
      description:
        "Go beyond tourist spots. We connect you with local culture, hidden destinations, and genuine interactions that create lasting memories.",
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      icon: Sparkles,
      title: "Small Group Sizes",
      description:
        "Intimate groups mean personalized attention, better wildlife viewing, and a more authentic experience. Quality over quantity, always.",
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const stats = [
    { number: "15,000+", label: "Happy Travelers", icon: Users, color: "blue" },
    { number: "98%", label: "Success Rate", icon: CheckCircle2, color: "emerald" },
    { number: "500+", label: "Adventures", icon: MapPin, color: "orange" },
    { number: "24/7", label: "Support", icon: Headphones, color: "purple" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/20 via-neutral-50/30 to-white py-20 lg:py-28">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute -left-20 top-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-primary-200/30 to-accent-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-secondary-200/30 to-primary-200/30 blur-3xl animation-delay-2000" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-accent-200/20 to-secondary-200/20 blur-3xl animation-delay-4000" />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-12">
        {/* Section Header with Enhanced Design */}
        <div className="mb-20 text-center" data-aos="fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200/50 bg-gradient-to-r from-primary-50 via-white to-primary-50 px-6 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
              <Award className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider text-primary-700">
              Why Choose Us
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800 bg-clip-text text-5xl font-extrabold text-transparent lg:text-6xl xl:text-7xl">
            Your Trusted Adventure Partner
          </h2>
          
          <div className="mx-auto mb-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-transparent via-secondary-500 to-secondary-500" />
            <div className="h-2 w-16 rounded-full bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-500" />
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-accent-500 via-transparent to-transparent" />
          </div>
          
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-text-light lg:text-2xl">
            Experience Tanzania with confidence. We combine{" "}
            <span className="font-semibold text-primary-700">local expertise</span>,{" "}
            <span className="font-semibold text-primary-700">ethical practices</span>, and{" "}
            <span className="font-semibold text-primary-700">exceptional service</span> to create unforgettable adventures.
          </p>
        </div>

        {/* Enhanced Stats Bar with Animations */}
        <div
          className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "from-blue-500 to-cyan-500",
              emerald: "from-emerald-500 to-teal-500",
              orange: "from-orange-500 to-amber-500",
              purple: "from-purple-500 to-indigo-500",
            };
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                onMouseEnter={() => setHoveredCard(`stat-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Animated Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                />
                
                {/* Shine Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:animate-shimmer" />
                
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${colorClasses[stat.color]} p-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className={`mb-2 bg-gradient-to-r ${colorClasses[stat.color]} bg-clip-text text-3xl font-extrabold text-transparent lg:text-4xl`}>
                    {stat.number}
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-text-light">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Advantages Grid with Staggered Layout */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            const isHovered = hoveredCard === `advantage-${index}`;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:border-transparent hover:shadow-2xl"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onMouseEnter={() => setHoveredCard(`advantage-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Animated Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${advantage.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                
                {/* Shimmer Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:animate-shimmer" />
                
                {/* Decorative Corner Accent */}
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${advantage.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className={`absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br ${advantage.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`} />

                {/* Content */}
                <div className="relative">
                  {/* Enhanced Icon with Gradient */}
                  <div className="mb-6 relative">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${advantage.gradient} opacity-20 blur-xl transition-all duration-300 group-hover:opacity-40 group-hover:blur-2xl`} />
                    <div className={`relative inline-flex rounded-2xl bg-gradient-to-br ${advantage.gradient} p-4 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className={`mb-4 bg-gradient-to-r ${advantage.gradient} bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:scale-105`}>
                    {advantage.title}
                  </h3>

                  {/* Description */}
                  <p className="leading-relaxed text-text-light transition-colors duration-300 group-hover:text-text">
                    {advantage.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary-600 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA with Premium Design */}
        <div
          className="mt-20 text-center"
          data-aos="fade-up"
          data-aos-delay="800"
        >
          <div className="group relative overflow-hidden rounded-3xl border border-primary-200/50 bg-gradient-to-br from-primary-50 via-white to-accent-50/30 p-12 shadow-2xl transition-all duration-500 hover:shadow-3xl lg:p-16">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]" />
            </div>
            
            {/* Shine Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100 group-hover:animate-shimmer" />
            
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary-200/50 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
                  Ready to Start Your Adventure?
                </h3>
              </div>
              
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-text-light lg:text-xl">
                Join <span className="font-bold text-primary-700">thousands of travelers</span> who have trusted us for their
                Tanzanian adventures. Let's create your perfect journey together.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/trips"
                  className="group/btn relative overflow-hidden inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 px-8 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100 group-hover/btn:animate-shimmer" />
                  <MapPin className="relative z-10 h-5 w-5" />
                  <span className="relative z-10">Explore Our Trips</span>
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
                <a
                  href="/contact-us"
                  className="group/btn inline-flex items-center gap-3 rounded-xl border-2 border-primary-400 bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary-500 hover:bg-primary-50 hover:shadow-xl"
                >
                  <Headphones className="h-5 w-5" />
                  <span>Contact Us</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      
      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;
