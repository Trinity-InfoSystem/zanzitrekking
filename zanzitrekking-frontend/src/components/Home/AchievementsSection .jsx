import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  get_achievements,
  get_clients,
  get_impact_stats,
} from "../../store/reducers/homeReducer";
import {
  Award,
  Briefcase,
  Building,
  CheckCircle,
  Compass,
  DollarSign,
  Heart,
  Shield,
  Star,
  Target,
  TreePine,
  Users,
} from "lucide-react";
import { IMAGES_URL } from "../../utils/constants";

// Icon mapping
const iconMap = {
  Award,
  Shield,
  Star,
  Users,
  TreePine,
  CheckCircle,
  Heart,
  DollarSign,
  Briefcase,
  Building,
  Target,
  Compass,
};

// Impact Stat Item Component
const ImpactStatItem = ({ stat, countingStarted }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!countingStarted) {
      setCount(0);
      return;
    }

    let startTime = null;
    const duration = stat.duration || 2000;
    const end = stat.value;
    const start = 0;

    const animate = (currentTime) => {
      if (!startTime) {startTime = currentTime;}
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [countingStarted, stat.value, stat.duration]);

  return (
    <div className="text-left">
      <div className="mb-1 text-2xl font-bold text-secondary-600 md:text-3xl">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
        {stat.labelStyle === "italic" && (
          <span className="ml-1 font-serif italic">{stat.label}</span>
        )}
      </div>
      {stat.labelStyle !== "italic" && (
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          {stat.label}
        </p>
      )}
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {stat.sublabel}
      </p>
    </div>
  );
};

const AchievementsSection = () => {
  const dispatch = useDispatch();
  const { achievements, impactStats, clients } = useSelector(
    (state) => state.home,
  );
  const [activeTab, setActiveTab] = useState("achievements");
  const [countingStarted, setCountingStarted] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(get_achievements());
    dispatch(get_impact_stats());
    dispatch(get_clients());
  }, [dispatch]);

  // Reset counting when impact tab is selected
  useEffect(() => {
    if (activeTab === "impact") {
      setCountingStarted(false);
      const timer = setTimeout(() => {
        setCountingStarted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Get icon component from string
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Award;
  };

  // Process achievements data
  const certifications = (achievements || [])
    .filter((a) => a.type === "certification")
    .map((cert) => ({
      ...cert,
      icon: cert.icon ? getIconComponent(cert.icon) : Compass,
      image: cert.image || cert.imageUrl || null,
    }));

  const awards = (achievements || [])
    .filter((a) => a.type === "award")
    .map((award) => ({
      ...award,
      icon: award.icon ? getIconComponent(award.icon) : Award,
      title: award.fullName || award.name,
      year: award.status,
      description: award.status,
      image: award.image || award.imageUrl || null,
    }));

  // Process impact stats
  const processedImpactStats = (impactStats || []).map((stat) => ({
    ...stat,
    labelStyle: stat.labelStyle || "normal",
  }));

  // Process clients data
  const clientCompanies = (clients || []).map((client) => ({
    name: client.name,
    logo: client.logo || client.logoUrl || "",
  }));

  return (
    <section
      id="achievements-section"
      className="relative bg-white py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
            <Award className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">
              Certified Excellence
            </span>
          </div>

          <h2 className="mb-3 text-3xl font-bold text-primary-800 lg:text-4xl">
            Our Achievements & Impact
          </h2>

          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />

          <p className="mx-auto max-w-2xl text-base text-text-light">
            Recognized by leading tourism organizations and committed to
            sustainable travel practices
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex gap-2 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-soft">
            {["achievements", "impact", "clients"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`rounded-md px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-primary-600 text-white shadow-soft"
                    : "text-text hover:bg-neutral-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            {/* Certifications Grid */}
            {certifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-500">No certifications available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-soft transition-all duration-200 hover:border-primary-200 hover:shadow-soft-md"
                  >
                    {/* Icon/Logo */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center">
                      {cert.image && (
                        <img
                          src={IMAGES_URL + cert.image.split("/").pop()}
                          alt={cert.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      )}
                      <div
                        className={`flex h-full w-full items-center justify-center rounded-lg ${cert.color || "bg-primary-50"}`}
                        style={{ display: cert.image ? "none" : "flex" }}
                      >
                        <cert.icon
                          className={`h-8 w-8 ${cert.iconColor || "text-primary-600"}`}
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-neutral-800">
                        {cert.fullName}
                      </h3>
                      <p className="text-sm text-neutral-500">{cert.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Awards Row */}
            {awards.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-500">No awards available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards.map((award, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-soft transition-all duration-200 hover:border-primary-200 hover:shadow-soft-md"
                  >
                    {/* Icon/Logo */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center">
                      {award.image && (
                        <img
                          src={IMAGES_URL + award.image.split("/").pop()}
                          alt={award.title}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      )}
                      <div
                        className="flex h-full w-full items-center justify-center rounded-lg bg-primary-50"
                        style={{ display: award.image ? "none" : "flex" }}
                      >
                        <award.icon className="h-8 w-8 text-primary-600" />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-neutral-800">
                        {award.title}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {award.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === "impact" && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="mx-auto max-w-2xl text-base text-text-light">
                Traveling with Zanzi Safaris not only contributes to the local
                economy, but also leaves a positive impact. For every traveler,
                we plant 3 trees in the Kilimanjaro region - Rundugai Area
              </p>
            </div>

            {/* Impact Stats with decorative images */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-50 to-primary-50/30 p-8 md:p-12">
              {/* Decorative images */}
              <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 opacity-30 md:h-56 md:w-56 md:opacity-50">
                <img
                  src="/images/impact-left.png"
                  alt=""
                  className="h-full w-full object-contain object-left-bottom"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-30 md:h-56 md:w-56 md:opacity-50">
                <img
                  src="/images/impact-right.png"
                  alt=""
                  className="h-full w-full object-contain object-right-bottom"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>

              {/* Stats Grid */}
              {processedImpactStats.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-neutral-500">
                    No impact statistics available
                  </p>
                </div>
              ) : (
                <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                  {processedImpactStats.map((stat, index) => (
                      <ImpactStatItem
                        key={index}
                        stat={stat}
                        countingStarted={countingStarted}
                      />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="space-y-10">
            <div className="mb-6 text-center">
              <h3 className="mb-3 text-xl font-bold text-primary-700">
                Trusted by Travelers From
              </h3>
              <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500" />
            </div>

            {clientCompanies.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-500">No clients available</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                {clientCompanies.map((company, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-soft transition-all duration-200 hover:border-primary-200 hover:shadow-soft-md"
                    >
                      {company.logo && (
                        <img
                          src={IMAGES_URL + company.logo.split("/").pop()}
                          alt={company.name}
                          className="h-16 w-auto"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span className="text-sm font-medium text-neutral-600">
                        {company.name}
                      </span>
                    </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-text-lighter">
                And many more satisfied travelers from Fortune 500 companies
                worldwide
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

export default AchievementsSection;
