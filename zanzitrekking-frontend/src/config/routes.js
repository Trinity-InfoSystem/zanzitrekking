/**
 * Route Configuration System
 * Centralized route definitions with metadata for SEO, code splitting, and performance
 */

export const BASE_URL = "https://booking.zanzisafaris.com";

/**
 * Route metadata configuration
 * Each route includes SEO metadata, priority, and chunk information
 */
export const routeConfig = {
  // Homepage - Highest priority
  home: {
    path: "/",
    component: () => import("../pages/Home"),
    priority: 1.0,
    changefreq: "daily",
    metadata: {
      title: "Zanzi Safaris - Tanzania Safari, Kilimanjaro Trek & Zanzibar Tours",
      description:
        "Experience unforgettable Tanzania safaris, Mount Kilimanjaro treks, and Zanzibar beach holidays with expert guides. Book your adventure today!",
      keywords:
        "Tanzania safari, Kilimanjaro trek, Zanzibar tours, African safari, Tanzania adventures, safari booking, wildlife tours",
      image: "/images/newZanzi.jpg",
      type: "website",
      structuredDataType: "Organization",
    },
    chunk: "home",
    preload: true, // Critical path
  },

  // Trips listing
  trips: {
    path: "/trips",
    component: () => import("../pages/Trips"),
    priority: 0.9,
    changefreq: "daily",
    metadata: {
      title: "Safari & Trekking Tours | Tanzania Adventures | Zanzi Safaris",
      description:
        "Browse our curated collection of Tanzania safari tours, Kilimanjaro mountain treks, and adventure packages. Premium guided experiences.",
      keywords:
        "safari tours, trekking tours Tanzania, Kilimanjaro climb, Serengeti safari, adventure packages",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "trips",
    preload: true,
  },

  // Trip details - Dynamic route
  tripDetails: {
    path: "/trip/details/:tripId",
    component: () => import("../pages/TripDetails"),
    priority: 0.8,
    changefreq: "weekly",
    metadata: {
      title: "Safari & Trek Details | Book Your Adventure | Zanzi Safaris",
      description:
        "View detailed itinerary, pricing, and booking information for this Tanzania adventure. Expert guides and premium service included.",
      keywords:
        "safari details, trek itinerary, Tanzania tour booking, adventure pricing",
      image: "/images/newZanzi.jpg",
      type: "website",
      structuredDataType: "TouristTrip",
    },
    chunk: "trip-details",
    dynamic: true,
    getMetadata: async (params) => {
      // This will be populated dynamically from API
      return null;
    },
  },

  // Blog listing
  blog: {
    path: "/blog",
    component: () => import("../pages/Blog"),
    priority: 0.8,
    changefreq: "daily",
    metadata: {
      title: "Travel Blog | Safari Tips & Tanzania Guides | Zanzi Safaris",
      description:
        "Read our latest travel guides, safari tips, and Tanzania adventure stories. Expert insights for your African journey.",
      keywords:
        "Tanzania travel blog, safari tips, travel guides Africa, adventure stories, Kilimanjaro tips",
      image: "/images/newZanzi.jpg",
      type: "website",
      structuredDataType: "Blog",
    },
    chunk: "blog",
    preload: false,
  },

  // Blog post - Dynamic route
  blogPost: {
    path: "/blog/:blogId",
    component: () => import("../pages/BlogPost"),
    priority: 0.7,
    changefreq: "weekly",
    metadata: {
      title: "Blog Article | Safari & Travel Tips | Zanzi Safaris",
      description:
        "Read expert insights, travel tips, and adventure stories from our Tanzania safari and trekking experiences.",
      keywords: "Tanzania blog, safari article, travel story, adventure guide",
      image: "/images/newZanzi.jpg",
      type: "article",
      structuredDataType: "BlogPosting",
    },
    chunk: "blog",
    dynamic: true,
    getMetadata: async (params) => {
      return null;
    },
  },

  // Careers listing
  careers: {
    path: "/careers",
    component: () => import("../pages/Jobs"),
    priority: 0.7,
    changefreq: "weekly",
    metadata: {
      title: "Careers | Join Our Team | Zanzi Safaris",
      description:
        "Explore career opportunities with Zanzi Safaris. Join our team of passionate adventure professionals in Tanzania.",
      keywords:
        "safari jobs, Tanzania tourism careers, guide jobs, travel industry jobs",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "careers",
    preload: false,
  },

  // Job details - Dynamic route
  jobDetails: {
    path: "/careers/:jobId",
    component: () => import("../pages/JobDetails"),
    priority: 0.6,
    changefreq: "weekly",
    metadata: {
      title: "Job Opening | Career Opportunity | Zanzi Safaris",
      description:
        "View job details and apply to join our team at Zanzi Safaris. Build your career in Tanzania's adventure tourism industry.",
      keywords: "job opening Tanzania, safari job details, tourism career",
      image: "/images/newZanzi.jpg",
      type: "website",
      structuredDataType: "JobPosting",
    },
    chunk: "careers",
    dynamic: true,
    getMetadata: async (params) => {
      return null;
    },
  },

  // About Us
  aboutUs: {
    path: "/about-us",
    component: () => import("../pages/AboutUs"),
    priority: 0.8,
    changefreq: "monthly",
    metadata: {
      title: "About Us | Expert Safari Guides | Zanzi Safaris",
      description:
        "Meet our team of expert guides and learn about our commitment to sustainable tourism and unforgettable African adventures.",
      keywords:
        "about Zanzi Safaris, expert guides Tanzania, sustainable tourism, safari company",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  // Contact Us
  contactUs: {
    path: "/contact-us",
    component: () => import("../pages/ContactUs"),
    priority: 0.8,
    changefreq: "monthly",
    metadata: {
      title: "Contact Us | Book Your Safari | Zanzi Safaris",
      description:
        "Get in touch with our team to plan your perfect Tanzania adventure. Expert advice and custom safari packages available.",
      keywords:
        "contact safari company, book Tanzania tour, safari inquiry, custom safari",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  // Cart
  cart: {
    path: "/cart",
    component: () => import("../pages/Cart"),
    priority: 0.5,
    changefreq: "always",
    metadata: {
      title: "Shopping Cart | Your Selected Adventures | Zanzi Safaris",
      description:
        "Review your selected safari and trekking adventures. Proceed to booking and secure your Tanzania experience.",
      keywords: "safari cart, booking cart, trip selection",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow", // Don't index cart pages
    },
    chunk: "checkout",
    preload: false,
  },

  // Checkout
  checkout: {
    path: "/checkout",
    component: () => import("../pages/Checkout"),
    priority: 0.4,
    changefreq: "always",
    metadata: {
      title: "Checkout | Complete Your Booking | Zanzi Safaris",
      description:
        "Complete your Tanzania safari or trek booking. Secure payment and instant confirmation.",
      keywords: "safari checkout, book Tanzania tour, secure booking",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow",
    },
    chunk: "checkout",
    preload: false,
  },

  // Order Confirmation
  orderConfirmation: {
    path: "/order-confirmation",
    component: () => import("../pages/OrderConfirmation"),
    priority: 0.3,
    changefreq: "always",
    metadata: {
      title: "Booking Confirmed | Thank You | Zanzi Safaris",
      description:
        "Your Tanzania adventure is confirmed! Check your email for booking details and pre-trip information.",
      keywords: "booking confirmation, safari booked, trip confirmed",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow",
    },
    chunk: "checkout",
    preload: false,
  },

  // Login
  login: {
    path: "/login",
    component: () => import("../pages/Login"),
    priority: 0.5,
    changefreq: "monthly",
    metadata: {
      title: "Login | Access Your Account | Zanzi Safaris",
      description:
        "Login to your Zanzi Safaris account to manage bookings, view trip details, and access exclusive offers.",
      keywords: "safari login, account access, customer portal",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow",
    },
    chunk: "auth",
    preload: false,
  },

  // Register
  register: {
    path: "/register",
    component: () => import("../pages/Register"),
    priority: 0.5,
    changefreq: "monthly",
    metadata: {
      title: "Register | Create Account | Zanzi Safaris",
      description:
        "Create your Zanzi Safaris account to book adventures, save favorites, and receive exclusive travel offers.",
      keywords: "create account, safari registration, sign up",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow",
    },
    chunk: "auth",
    preload: false,
  },

  // Dashboard
  dashboard: {
    path: "/dashboard",
    component: () => import("../pages/Dashboard"),
    priority: 0.4,
    changefreq: "always",
    metadata: {
      title: "My Dashboard | Manage Bookings | Zanzi Safaris",
      description:
        "Access your personal dashboard to manage bookings, view trip history, and update your profile.",
      keywords: "customer dashboard, manage bookings, trip history",
      image: "/images/newZanzi.jpg",
      type: "website",
      robots: "noindex, nofollow",
    },
    chunk: "dashboard",
    preload: false,
    requiresAuth: true,
  },

  // Reviews pages
  googleReviews: {
    path: "/reviews/google",
    component: () => import("../pages/GoogleReviews"),
    priority: 0.6,
    changefreq: "weekly",
    metadata: {
      title: "Google Reviews | Customer Testimonials | Zanzi Safaris",
      description:
        "Read authentic reviews from our satisfied customers on Google. See why travelers choose Zanzi Safaris for their Tanzania adventures.",
      keywords:
        "Zanzi Safaris reviews, Google reviews Tanzania safari, customer testimonials",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  tripAdvisorReviews: {
    path: "/reviews/tripadvisor",
    component: () => import("../pages/TripAdvisorReviews"),
    priority: 0.6,
    changefreq: "weekly",
    metadata: {
      title: "TripAdvisor Reviews | Traveler Ratings | Zanzi Safaris",
      description:
        "Browse our TripAdvisor reviews and ratings. Discover why we're a top-rated safari company in Tanzania.",
      keywords:
        "TripAdvisor reviews, Tanzania safari ratings, traveler reviews",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  // Legal pages
  termsOfService: {
    path: "/terms-of-service",
    component: () => import("../pages/TermsofService"),
    priority: 0.3,
    changefreq: "monthly",
    metadata: {
      title: "Terms of Service | Legal Information | Zanzi Safaris",
      description:
        "Read our terms of service, booking conditions, and legal policies for Tanzania safari and trekking tours.",
      keywords: "terms of service, booking terms, safari policies",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  privacyPolicy: {
    path: "/privacy-policy",
    component: () => import("../pages/PrivacyPolicy"),
    priority: 0.3,
    changefreq: "monthly",
    metadata: {
      title: "Privacy Policy | Data Protection | Zanzi Safaris",
      description:
        "Learn how we protect your personal information and respect your privacy. Our commitment to data security.",
      keywords: "privacy policy, data protection, customer privacy",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },

  cookiePolicy: {
    path: "/cookie-policy",
    component: () => import("../pages/CookiesPolicy"),
    priority: 0.3,
    changefreq: "monthly",
    metadata: {
      title: "Cookie Policy | Website Cookies | Zanzi Safaris",
      description:
        "Understand how we use cookies to improve your browsing experience on our website.",
      keywords: "cookie policy, website cookies, privacy",
      image: "/images/newZanzi.jpg",
      type: "website",
    },
    chunk: "static",
    preload: false,
  },
};

/**
 * Get route config by path
 */
export const getRouteConfig = (pathname) => {
  // Remove query params and trailing slashes
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Try exact match first
  const exactMatch = Object.values(routeConfig).find(
    (route) => route.path === cleanPath,
  );

  if (exactMatch) {return exactMatch;}

  // Try dynamic route matching
  for (const route of Object.values(routeConfig)) {
    if (route.dynamic && route.path.includes(":")) {
      const pattern = route.path.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(cleanPath)) {
        return route;
      }
    }
  }

  // Return default/home route
  return routeConfig.home;
};

/**
 * Get all static routes for sitemap generation
 */
export const getStaticRoutes = () => {
  return Object.values(routeConfig).filter((route) => !route.dynamic);
};

/**
 * Get all routes that should be preloaded
 */
export const getPreloadRoutes = () => {
  return Object.values(routeConfig).filter((route) => route.preload);
};
