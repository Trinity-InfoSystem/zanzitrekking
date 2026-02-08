"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get_whoWeAre } from "../store/reducers/aboutUsReducer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Award,
  CheckCircle,
  Compass,
  Eye,
  Globe,
  Heart,
  Mountain,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { get_statistic_data } from "../store/reducers/homeReducer";
import { IMAGES_URL } from "../utils/constants";
const AboutUs = () => {
  const dispatch = useDispatch();
  const { whoWeAre } = useSelector((state) => state.aboutUs);
  const { statisticData } = useSelector((state) => state.home);

  useEffect(() => {
    dispatch(get_statistic_data());
    dispatch(get_whoWeAre());
  }, [dispatch]);

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 600,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50/30 to-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center" data-aos="fade-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
                <Users className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  About Us
                </span>
              </div>

              <h1 className="mb-6 text-4xl font-bold text-primary-800 lg:text-5xl">
                {whoWeAre?.mainTitle ||
                  "Explore the Wild Heart of Tanzania with Experts"}
              </h1>

              <p className="mx-auto max-w-4xl text-base leading-relaxed text-text-light lg:text-lg">
                {whoWeAre?.paragraph ||
                  "Zanzi Trekking and Safari is a reputable tour operator based in Tanzania, East Africa. We are specialized in providing personalized and unforgettable adventures in Tanzania to clients from around the world."}
              </p>
            </div>

            {/* Quick Stats */}
            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-4"
              data-aos="fade-up"
            >
              <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-soft">
                <div className="mb-2 text-3xl font-bold text-primary-600">
                  {statisticData?.years || "10+"}
                </div>
                <div className="text-sm text-text-light">Years Experience</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-soft">
                <div className="mb-2 text-3xl font-bold text-secondary-600">
                  {statisticData?.customers || "5K+"}
                </div>
                <div className="text-sm text-text-light">Happy Clients</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-soft">
                <div className="mb-2 text-3xl font-bold text-accent-600">
                  {statisticData?.rating || "4.9"}
                </div>
                <div className="text-sm text-text-light">Star Rating</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-soft">
                <div className="mb-2 text-3xl font-bold text-primary-600">
                  {statisticData?.destinations || "50+"}
                </div>
                <div className="text-sm text-text-light">Destinations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {whoWeAre && (whoWeAre.image1 || whoWeAre.image2 || whoWeAre.image3) && (
        <section className="border-b border-neutral-200 bg-white py-16 lg:py-20">
          <div className="px-4 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 text-center" data-aos="fade-up">
                <h2 className="mb-4 text-3xl font-bold text-primary-800 lg:text-4xl">
                  Meet Our Team
                </h2>
                <p className="mx-auto max-w-2xl text-base text-text-light">
                  Experienced professionals dedicated to making your adventure
                  unforgettable
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {whoWeAre.image1 && (
                  <TeamMemberCard image={whoWeAre.image1} delay="0" />
                )}
                {whoWeAre.image2 && (
                  <TeamMemberCard image={whoWeAre.image2} delay="100" />
                )}
                {whoWeAre.image3 && (
                  <TeamMemberCard image={whoWeAre.image3} delay="200" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50/30 to-white py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div
              className="grid grid-cols-2 gap-6 md:grid-cols-4"
              data-aos="fade-up"
            >
              <StatCard
                icon={Users}
                value={statisticData?.totalClients || "5,000+"}
                label="Satisfied Travelers"
                color="primary"
              />
              <StatCard
                icon={Mountain}
                value={statisticData?.totalTrips || "200+"}
                label="Adventures Offered"
                color="secondary"
              />
              <StatCard
                icon={Award}
                value={statisticData?.awards || "25+"}
                label="Industry Awards"
                color="accent"
              />
              <StatCard
                icon={Globe}
                value={statisticData?.destinations || "50+"}
                label="Destinations Covered"
                color="primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="border-b border-neutral-200 bg-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center" data-aos="fade-up">
              <h2 className="mb-4 text-3xl font-bold text-primary-800 lg:text-4xl">
                Our Mission & Vision
              </h2>
              <p className="mx-auto max-w-2xl text-base text-text-light">
                Guided by our core principles and commitment to excellence
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div
                className="rounded-xl border border-neutral-200 bg-white p-8 shadow-soft"
                data-aos="fade-right"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50">
                  <Target className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary-800">
                  Our Mission
                </h3>
                <p className="leading-relaxed text-text-light">
                  To provide authentic, sustainable, and life-changing safari
                  and trekking experiences while supporting local communities
                  and preserving Tanzania&apos;s natural heritage for future
                  generations.
                </p>
              </div>

              <div
                className="rounded-xl border border-neutral-200 bg-white p-8 shadow-soft"
                data-aos="fade-left"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary-50">
                  <Eye className="h-7 w-7 text-secondary-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary-800">
                  Our Vision
                </h3>
                <p className="leading-relaxed text-text-light">
                  To be East Africa&apos;s most trusted adventure company, recognized
                  for exceptional service, environmental stewardship, and
                  creating meaningful connections between travelers and
                  Tanzania&apos;s wonders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50/30 to-white py-16 lg:py-20">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center" data-aos="fade-up">
              <h2 className="mb-4 text-3xl font-bold text-primary-800 lg:text-4xl">
                Our Core Values
              </h2>
              <p className="mx-auto max-w-2xl text-base text-text-light">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ValueCard
                icon={Shield}
                title="Safety First"
                description="Your safety is our top priority. We maintain the highest standards in equipment, training, and protocols."
                delay="0"
              />
              <ValueCard
                icon={Heart}
                title="Sustainability"
                description="We&apos;re committed to responsible tourism that protects wildlife and supports local communities."
                delay="100"
              />
              <ValueCard
                icon={Award}
                title="Excellence"
                description="We strive for excellence in every aspect of your journey, from planning to execution."
                delay="200"
              />
              <ValueCard
                icon={Compass}
                title="Authenticity"
                description="Experience the real Tanzania through genuine local connections and cultural immersion."
                delay="0"
              />
              <ValueCard
                icon={Users}
                title="Customer Focus"
                description="Your dreams and satisfaction drive everything we do. We listen, adapt, and deliver."
                delay="100"
              />
              <ValueCard
                icon={TrendingUp}
                title="Innovation"
                description="We continuously improve our services and embrace new ways to enhance your experience."
                delay="200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center" data-aos="fade-up">
              <h2 className="mb-4 text-3xl font-bold text-primary-800 lg:text-4xl">
                Why Choose Us
              </h2>
              <p className="mx-auto max-w-2xl text-base text-text-light">
                What sets us apart in the adventure travel industry
              </p>
            </div>

            <div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              data-aos="fade-up"
            >
              <WhyChooseCard
                icon={CheckCircle}
                text="Expert local guides with deep knowledge"
              />
              <WhyChooseCard
                icon={CheckCircle}
                text="Customizable itineraries for every traveler"
              />
              <WhyChooseCard
                icon={CheckCircle}
                text="24/7 support throughout your journey"
              />
              <WhyChooseCard
                icon={CheckCircle}
                text="Competitive pricing with no hidden fees"
              />
              <WhyChooseCard
                icon={CheckCircle}
                text="Sustainable and eco-friendly practices"
              />
              <WhyChooseCard
                icon={CheckCircle}
                text="Licensed and fully insured operations"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const TeamMemberCard = ({ image, delay }) => {
  return (
    <div
      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all hover:shadow-soft-md"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={IMAGES_URL + image.split("/").pop()} // ✅ UPDATED - Simple logic
          alt="Team Member"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
          <span className="text-sm font-medium text-primary-700">
            Expert Guide
          </span>
        </div>
        <p className="text-sm text-text-light">
          Dedicated to providing exceptional safari experiences
        </p>
      </div>
    </div>
  );
};
const StatCard = ({ icon: Icon, value, label, color }) => {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600",
    secondary: "bg-secondary-50 text-secondary-600",
    accent: "bg-accent-50 text-accent-600",
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-soft transition-all hover:shadow-soft-md">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="mb-1 text-2xl font-bold text-primary-800">{value}</div>
      <div className="text-sm text-text-light">{label}</div>
    </div>
  );
};

const ValueCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <div
      className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-md"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 transition-colors group-hover:bg-primary-100">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary-800">{title}</h3>
      <p className="text-sm leading-relaxed text-text-light">{description}</p>
    </div>
  );
};

const WhyChooseCard = ({ icon: Icon, text }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-soft transition-all hover:border-primary-300 hover:shadow-soft-md">
      <Icon className="h-5 w-5 flex-shrink-0 text-primary-600" />
      <p className="text-sm font-medium text-text">{text}</p>
    </div>
  );
};

export default AboutUs;
