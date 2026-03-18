import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getRouteConfig } from "../config/routes";

/**
 * SEO Component
 *
 * Usage:
 * - On static pages (Home, Trips, Blog listing, etc.): just use <SEO /> with no props,
 *   it will pick up metadata from routeConfig automatically.
 *
 * - On dynamic pages (TripDetails, BlogPost, JobDetails): pass props from already-fetched data:
 *   <SEO
 *     title="3-Day Safari | Zanzi Safaris"
 *     description="..."
 *     image="https://..."
 *     type="trip"          // "trip" | "blog" | "job" | "website"
 *     data={tripObject}    // full object for JSON-LD structured data
 *   />
 *
 * This component does NOT make any API calls.
 * Data should be fetched by the page component and passed as props.
 */
const SEO = ({ title: propTitle, description: propDescription, image: propImage, type: propType, data = null }) => {
  const location = useLocation();
  // Use frontend URL from env or fallback to current origin (for SEO, we need the frontend URL, not API URL)
  const baseUrl = import.meta.env.VITE_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://zanzisafaris.com");

  // Get static metadata from route config as fallback
  const routeConfig = getRouteConfig(location.pathname);
  const staticMeta = routeConfig?.metadata || {};

  // Merge: props override route config which overrides defaults
  const title = propTitle || staticMeta.title || "Zanzi Safaris | Tanzania Safari & Adventure Tours";
  const description = propDescription || staticMeta.description || "Explore Tanzania with Zanzi Safaris - Your trusted partner for authentic African adventures, wildlife safaris, and mountain treks.";
  const keywords = staticMeta.keywords || "Tanzania safari, African tours, adventure travel, wildlife tours";
  const image = propImage || staticMeta.image || "/images/newZanzi.jpg";
  const pageType = propType || staticMeta.type || "website";
  const robots = staticMeta.robots || "index, follow";

  const currentUrl = `${baseUrl}${location.pathname}`;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  // ─── Structured Data (JSON-LD) ───────────────────────────────────────────

  const getStructuredData = () => {
    const baseOrg = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: "Zanzi Safaris",
      url: baseUrl,
      logo: `${baseUrl}/images/newZanzi.jpg`,
      description: "Tanzania Safari, Kilimanjaro Trek & Zanzibar Tours",
      address: {
        "@type": "PostalAddress",
        addressCountry: "TZ",
        addressLocality: "Arusha",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Service",
        url: `${baseUrl}/contact-us`,
      },
      // ✅ Fill in your real social media URLs here
      sameAs: [
        // "https://www.facebook.com/zanzisafaris",
        // "https://www.instagram.com/zanzisafaris",
        // "https://www.tiktok.com/@zanzisafaris",
      ],
    };

    // Homepage
    if (location.pathname === "/") {
      return {
        ...baseOrg,
        "@type": "Organization",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/trips?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
        // ✅ TODO: Replace with real review count from your DB
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
        areaServed: { "@type": "Country", name: "Tanzania" },
        serviceType: ["Safari Tours", "Mountain Trekking", "Beach Holidays", "Adventure Travel"],
      };
    }

    // Trip details — data is passed from TripDetails page
    if (location.pathname.startsWith("/trip/details/") && propType === "trip" && data) {
      const schema = {
        "@context": "https://schema.org",
        "@type": ["TouristTrip", "Product"],
        name: title,
        description: data.description || data.overview || description,
        url: currentUrl,
        image: data.images?.length ? data.images : [fullImageUrl],
        provider: {
          "@type": "TravelAgency",
          name: "Zanzi Safaris",
          url: baseUrl,
        },
        // ✅ Fixed: use correct field names from your Trip model
        offers: (data.startingPrice || data.price) ? {
          "@type": "Offer",
          price: data.startingPrice || data.price,
          priceCurrency: data.currency || "USD",
          availability: "https://schema.org/InStock",
          url: currentUrl,
        } : undefined,
        duration: data.duration ? `P${data.duration}D` : undefined,
        location: {
          "@type": "Place",
          name: data.location || data.destination || "Tanzania",
          address: {
            "@type": "PostalAddress",
            addressCountry: "TZ",
          },
        },
        // ✅ Wire in real reviews when available
        // aggregateRating: data.rating ? {
        //   "@type": "AggregateRating",
        //   ratingValue: data.rating,
        //   reviewCount: data.reviewCount,
        // } : undefined,
      };

      // Clean undefined fields
      Object.keys(schema).forEach(key => schema[key] === undefined && delete schema[key]);
      return schema;
    }

    // Blog listing
    if (location.pathname === "/blog") {
      return {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Zanzi Safaris Travel Blog",
        url: `${baseUrl}/blog`,
        description: "Travel guides, safari tips, and Tanzania adventure stories",
        publisher: { "@type": "Organization", name: "Zanzi Safaris" },
      };
    }

    // Blog post — data is passed from BlogPost page
    if (location.pathname.startsWith("/blog/") && propType === "blog" && data) {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: data.description || data.mainParagraph || description,
        url: currentUrl,
        image: fullImageUrl,
        author: { "@type": "Organization", name: "Zanzi Safaris" },
        publisher: {
          "@type": "Organization",
          name: "Zanzi Safaris",
          logo: { "@type": "ImageObject", url: `${baseUrl}/images/newZanzi.jpg` },
        },
        datePublished: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
        dateModified: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": currentUrl },
        articleSection: data.category || "Travel",
        keywords: data.tags?.join(", ") || keywords,
      };
    }

    // Job posting — data is passed from JobDetails page
    if (location.pathname.startsWith("/careers/") && propType === "job" && data) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title,
        description: data.description || description,
        url: currentUrl,
        datePosted: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
        employmentType: data.employmentType || "FULL_TIME",
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressCountry: "TZ",
            addressLocality: "Tanzania",
          },
        },
        hiringOrganization: {
          "@type": "Organization",
          name: "Zanzi Safaris",
          url: baseUrl,
          logo: `${baseUrl}/images/newZanzi.jpg`,
        },
        baseSalary: data.salary ? {
          "@type": "MonetaryAmount",
          currency: data.currency || "USD",
          value: { "@type": "QuantitativeValue", value: data.salary },
        } : undefined,
      };

      Object.keys(schema).forEach(key => schema[key] === undefined && delete schema[key]);
      return schema;
    }

    return baseOrg;
  };

  // ─── Breadcrumb Schema ────────────────────────────────────────────────────

  const getBreadcrumbSchema = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) {
      return null;
    }

    const breadcrumbs = [{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (segment === "trip" || segment === "details") {
        return;
      }

      const nameMap = {
        blog: "Blog",
        careers: "Careers",
        "about-us": "About Us",
        "contact-us": "Contact Us",
        trips: "Trips",
        "privacy-policy": "Privacy Policy",
        "terms-of-service": "Terms of Service",
        "cookie-policy": "Cookie Policy",
      };

      const name = nameMap[segment] ||
        segment.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      breadcrumbs.push({
        "@type": "ListItem",
        position: index + 2,
        name,
        item: `${baseUrl}${currentPath}`,
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    };
  };

  // ─── FAQ Schema ───────────────────────────────────────────────────────────

  const getFAQSchema = () => {
    const faqs = [];

    if (location.pathname === "/") {
      faqs.push(
        {
          "@type": "Question",
          name: "What types of safaris does Zanzi Safaris offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Zanzi Safaris offers Tanzania safaris, Mount Kilimanjaro treks, and Zanzibar beach holidays. We provide expert-guided adventures including wildlife safaris, mountain climbing, and cultural tours.",
          },
        },
        {
          "@type": "Question",
          name: "How do I book a safari with Zanzi Safaris?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can browse our trips, select your preferred adventure, and book directly through our website. Our team is also available via contact form or phone to help customize your Tanzania experience.",
          },
        },
        {
          "@type": "Question",
          name: "Where does Zanzi Safaris operate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Zanzi Safaris operates in Tanzania, offering safaris in national parks like Serengeti and Ngorongoro, Mount Kilimanjaro treks, and Zanzibar island tours.",
          },
        },
      );
    }

    if (location.pathname.startsWith("/trip/details/") && propType === "trip" && data) {
      faqs.push(
        {
          "@type": "Question",
          name: `What is included in ${data.mainTitle || data.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: data.description || `The ${data.mainTitle || data.title} includes expert guides, transportation, accommodations, and all activities as specified in the itinerary.`,
          },
        },
        {
          "@type": "Question",
          name: `How long is the ${data.mainTitle || data.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: data.duration
              ? `The ${data.mainTitle || data.title} is ${data.duration} days.`
              : `Please contact us for duration details on ${data.mainTitle || data.title}.`,
          },
        },
      );
    }

    if (faqs.length === 0) {
      return null;
    }

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs,
    };
  };

  const structuredData = getStructuredData();
  const breadcrumbData = getBreadcrumbSchema();
  const faqData = getFAQSchema();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />

      {/* Open Graph */}
      <meta property="og:type" content={pageType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Zanzi Safaris" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />

      {/* Favicon */}
      <link rel="icon" href="/favicon/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />

      {/* Geo & Author */}
      <meta name="language" content="English" />
      <meta name="author" content="Zanzi Safaris" />
      <meta name="geo.region" content="TZ" />
      <meta name="geo.placename" content="Tanzania" />

      {/* Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* ✅ JSON-LD scripts inside Helmet so they're managed on route changes */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      {breadcrumbData && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      )}
      {faqData && (
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
