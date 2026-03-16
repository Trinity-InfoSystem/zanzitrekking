import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import { BASE_URL, getRouteConfig } from "../config/routes";
import api from "../api/api";

const SEO = () => {
  const location = useLocation();
  const params = useParams();
  const [dynamicMetadata, setDynamicMetadata] = useState(null);
  const [dynamicContent, setDynamicContent] = useState(null); // Store full content for AI search
  const baseUrl = BASE_URL;

  // Fetch dynamic metadata for dynamic routes (trips, blog posts, jobs)
  useEffect(() => {
    const fetchDynamicMetadata = async () => {
      const routeConfig = getRouteConfig(location.pathname);

      if (routeConfig?.dynamic) {
        try {
          let metadata = null;

          // Fetch trip metadata
          if (location.pathname.startsWith("/trip/details/") && params.tripId) {
            try {
              const { data } = await api.get(`/trip-get/${params.tripId}`);
              if (data?.trip) {
                const tripTitle = data.trip.mainTitle || data.trip.title;
                const tripDescription = data.trip.description || data.trip.overview || "";
                const tripImage = data.trip.images?.[0] || data.trip.mainImage || "/images/newZanzi.jpg";
                
                metadata = {
                  title: `${tripTitle} | Safari Details | Zanzi Safaris`,
                  description: tripDescription
                    ? tripDescription.substring(0, 160)
                    : `Book ${tripTitle} - Expert guided Tanzania safari adventure.`,
                  image: tripImage,
                };
                // Store full trip data for AI search optimization
                setDynamicContent({
                  type: "trip",
                  data: {
                    ...data.trip,
                    title: tripTitle,
                    images: data.trip.images || (data.trip.mainImage ? [data.trip.mainImage] : []),
                  },
                });
              }
            } catch (error) {
              // Failed to fetch trip metadata - use defaults
            }
          }

          // Fetch blog post metadata
          if (location.pathname.startsWith("/blog/") && params.blogId) {
            try {
              const { data } = await api.get(`/blogPost-get/${params.blogId}`);
              if (data?.blogPost) {
                const blogTitle = data.blogPost.mainTitle || data.blogPost.title;
                // Create description from mainParagraph or combine paragraphs
                const blogDescription = data.blogPost.description || 
                  data.blogPost.mainParagraph || 
                  data.blogPost.secondParagraph || 
                  "";
                const blogImage = data.blogPost.mainImage || data.blogPost.image || "/images/newZanzi.jpg";
                
                metadata = {
                  title: `${blogTitle} | Travel Blog | Zanzi Safaris`,
                  description: blogDescription
                    ? blogDescription.substring(0, 160)
                    : `Read ${blogTitle} on Zanzi Safaris travel blog.`,
                  image: blogImage,
                };
                // Store full blog post data for AI search optimization
                setDynamicContent({
                  type: "blog",
                  data: {
                    ...data.blogPost,
                    title: blogTitle,
                    description: blogDescription,
                    image: blogImage,
                  },
                });
              }
            } catch (error) {
              // Failed to fetch blog metadata - use defaults
            }
          }

          // Fetch job metadata
          if (location.pathname.startsWith("/careers/") && params.jobId) {
            try {
              const { data } = await api.get(`/job-get/${params.jobId}`);
              if (data?.job) {
                metadata = {
                  title: `${data.job.title} | Career Opportunity | Zanzi Safaris`,
                  description: data.job.description
                    ? data.job.description.substring(0, 160)
                    : `Apply for ${data.job.title} position at Zanzi Safaris.`,
                  image: "/images/newZanzi.jpg",
                };
                // Store full job data for AI search optimization
                setDynamicContent({
                  type: "job",
                  data: data.job,
                });
              }
            } catch (error) {
              // Failed to fetch job metadata - use defaults
            }
          }

          setDynamicMetadata(metadata);
        } catch (error) {
          setDynamicMetadata(null);
          setDynamicContent(null);
        }
      } else {
        setDynamicMetadata(null);
        setDynamicContent(null);
      }
    };

    fetchDynamicMetadata();
  }, [location.pathname, params]);

  // Get page metadata from route config
  const getPageMeta = () => {
    const routeConfig = getRouteConfig(location.pathname);
    const baseMetadata = routeConfig?.metadata || {};

    // Merge dynamic metadata if available
    if (dynamicMetadata) {
      return {
        ...baseMetadata,
        ...dynamicMetadata,
      };
    }

    return baseMetadata;
  };

  const metadata = getPageMeta();
  const {
    title = "Zanzi Safaris | Tanzania Safari & Adventure Tours",
    description = "Explore Tanzania with Zanzi Safaris - Your trusted partner for authentic African adventures, wildlife safaris, and mountain treks.",
    keywords = "Tanzania safari, African tours, adventure travel, wildlife tours",
    image = "/images/newZanzi.jpg",
    type = "website",
    robots = "index, follow",
  } = metadata;

  const currentUrl = `${baseUrl}${location.pathname}`;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  // Generate breadcrumb structured data for AI search
  const getBreadcrumbSchema = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const position = index + 2;
      let name = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Special handling for known routes
      if (segment === "trip" || segment === "details") {
        return;
      }
      if (segment === "blog" && index === 0) {
        name = "Blog";
      } else if (segment === "careers" && index === 0) {
        name = "Careers";
      } else if (segment === "about-us") {
        name = "About Us";
      } else if (segment === "contact-us") {
        name = "Contact Us";
      }

      breadcrumbs.push({
        "@type": "ListItem",
        position,
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

  // Generate FAQ schema for AI search (common questions)
  const getFAQSchema = () => {
    const faqs = [];

    // Homepage FAQs
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

    // Trip page FAQs
    if (location.pathname.startsWith("/trip/details/") && dynamicContent?.type === "trip") {
      const trip = dynamicContent.data;
      faqs.push(
        {
          "@type": "Question",
          name: `What is included in ${trip.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: trip.description || `The ${trip.title} includes expert guides, transportation, accommodations, and all activities as specified in the itinerary.`,
          },
        },
        {
          "@type": "Question",
          name: `How long is the ${trip.title}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: trip.duration
              ? `The ${trip.title} is ${trip.duration} days.`
              : `Please contact us for specific duration details for ${trip.title}.`,
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

  // Generate structured data (JSON-LD) for better SEO and AI search
  const getStructuredData = () => {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: "Zanzi Safaris",
      url: baseUrl,
      logo: `${baseUrl}/images/newZanzi.jpg`,
      description: "Tanzania Safari, Kilimanjaro Trek & Zanzibar Tours",
      address: {
        "@type": "PostalAddress",
        addressCountry: "TZ",
        addressLocality: "Tanzania",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Service",
        url: `${baseUrl}/contact-us`,
      },
      sameAs: [
        // Add social media links if available
        // "https://www.facebook.com/zanzisafaris",
        // "https://www.instagram.com/zanzisafaris",
      ],
    };

    // Homepage - Enhanced Organization with SearchAction
    if (location.pathname === "/") {
      return {
        ...baseStructuredData,
        "@type": "Organization",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/trips?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
        areaServed: {
          "@type": "Country",
          name: "Tanzania",
        },
        serviceType: [
          "Safari Tours",
          "Mountain Trekking",
          "Beach Holidays",
          "Adventure Travel",
        ],
      };
    }

    // Trip details - Enhanced TouristTrip with Event schema for AI search
    if (location.pathname.startsWith("/trip/details/")) {
      const trip = dynamicContent?.type === "trip" ? dynamicContent.data : null;

      const tripSchema = {
        "@context": "https://schema.org",
        "@type": ["TouristTrip", "Event"],
        name: title,
        description: trip?.description || description,
        url: currentUrl,
        image: trip?.images || [fullImageUrl],
        provider: {
          "@type": "TravelAgency",
          name: "Zanzi Safaris",
          url: baseUrl,
          logo: `${baseUrl}/images/newZanzi.jpg`,
        },
        offers: trip?.price
          ? {
              "@type": "Offer",
              price: trip.price,
              priceCurrency: trip.currency || "USD",
              availability: "https://schema.org/InStock",
              url: currentUrl,
            }
          : undefined,
        duration: trip?.duration
          ? `P${trip.duration}D`
          : undefined,
        location: {
          "@type": "Place",
          name: trip?.location || "Tanzania",
          address: {
            "@type": "PostalAddress",
            addressCountry: "TZ",
          },
        },
      };

      // Remove undefined fields
      Object.keys(tripSchema).forEach(
        (key) => tripSchema[key] === undefined && delete tripSchema[key],
      );

      return tripSchema;
    }

    // Blog listing
    if (location.pathname === "/blog") {
      return {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Zanzi Safaris Travel Blog",
        url: `${baseUrl}/blog`,
        description: "Travel guides, safari tips, and Tanzania adventure stories",
        publisher: {
          "@type": "Organization",
          name: "Zanzi Safaris",
        },
      };
    }

    // Blog post - Enhanced BlogPosting for AI search
    if (location.pathname.startsWith("/blog/")) {
      const blogPost = dynamicContent?.type === "blog" ? dynamicContent.data : null;

      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: blogPost?.description || description,
        url: currentUrl,
        image: fullImageUrl,
        author: {
          "@type": "Organization",
          name: "Zanzi Safaris",
        },
        publisher: {
          "@type": "Organization",
          name: "Zanzi Safaris",
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/images/newZanzi.jpg`,
          },
        },
        datePublished: blogPost?.createdAt
          ? new Date(blogPost.createdAt).toISOString()
          : new Date().toISOString(),
        dateModified: blogPost?.updatedAt
          ? new Date(blogPost.updatedAt).toISOString()
          : undefined,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": currentUrl,
        },
        articleSection: blogPost?.category || "Travel",
        keywords: blogPost?.tags?.join(", ") || keywords,
      };
    }

    // Job posting - Enhanced JobPosting for AI search
    if (location.pathname.startsWith("/careers/")) {
      const job = dynamicContent?.type === "job" ? dynamicContent.data : null;

      return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title,
        description: job?.description || description,
        url: currentUrl,
        datePosted: job?.createdAt
          ? new Date(job.createdAt).toISOString()
          : new Date().toISOString(),
        employmentType: job?.employmentType || "FULL_TIME",
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
        baseSalary: job?.salary
          ? {
              "@type": "MonetaryAmount",
              currency: job.currency || "USD",
              value: {
                "@type": "QuantitativeValue",
                value: job.salary,
              },
            }
          : undefined,
      };
    }

    return baseStructuredData;
  };

  const structuredData = getStructuredData();
  const breadcrumbData = getBreadcrumbSchema();
  const faqData = getFAQSchema();

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
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

        {/* Canonical URL */}
        <link rel="canonical" href={currentUrl} />

        {/* Favicon */}
        <link rel="icon" href="/favicon/favicon-16x16.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />

        {/* Additional SEO tags */}
        <meta name="language" content="English" />
        <meta name="author" content="Zanzi Safaris" />
        <meta name="geo.region" content="TZ" />
        <meta name="geo.placename" content="Tanzania" />

        {/* Mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>

      {/* Primary Structured Data (JSON-LD) for SEO and AI search */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Breadcrumb Structured Data for AI search context */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}

      {/* FAQ Structured Data for AI search (ChatGPT, Perplexity, etc.) */}
      {faqData && (
        <script type="application/ld+json">
          {JSON.stringify(faqData)}
        </script>
      )}
    </>
  );
};

export default SEO;
