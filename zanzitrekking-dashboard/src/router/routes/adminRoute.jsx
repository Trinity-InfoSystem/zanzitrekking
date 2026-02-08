import { lazy } from "react";

const Meals = lazy(() => import("../../views/admin/meals"));
const Trips = lazy(() => import("../../views/admin/Trips"));
const Banner = lazy(() => import("../../views/admin/Banner"));
const AddBlog = lazy(() => import("../../views/admin/AddBlog"));
const BlogPosts = lazy(() => import("../../views/admin/BlogPosts"));
const WhoWeAre = lazy(() => import("../../views/admin/WhoWeAre"));
const Exclusions = lazy(() => import("../../views/admin/Exclusions"));
const Accommodations = lazy(() => import("../../views/admin/Accommodations"));
const AdminDashboard = lazy(() => import("../../views/admin/AdminDashboard"));
const Category = lazy(() => import("../../views/admin/Category"));
const Inclusion = lazy(() => import("../../views/admin/Inclusions"));
const Payments = lazy(() => import("../../views/admin/Payments"));
const AdminToCustomer = lazy(() => import("../../views/admin/AdminToCustomer"));
const AdminToAdmin = lazy(() => import("../../views/admin/AdminToAdmin"));
const AddTrip = lazy(() => import("../../views/admin/AddTrip"));
const Customers = lazy(() => import("../../views/admin/Customers"));
const Profile = lazy(() => import("../../views/admin/Profile"));
const PdfManager = lazy(() => import("../../views/admin/PdfManager"));
const Newsletter = lazy(() => import("../../views/admin/Newsletter"));
const AdminManagement = lazy(() => import("../../views/admin/AdminManagement"));
const Partners = lazy(() => import("../../views/admin/Partners"));
const AddPartner = lazy(() => import("../../views/admin/AddPartner"));
const EditPartner = lazy(() => import("../../views/admin/EditPartner"));
const Reviews = lazy(() => import("../../views/admin/Reviews"));
const SafariRequests = lazy(() => import("../../views/admin/SafariRequests"));
const UrgentBookingRequests = lazy(() => import("../../views/admin/UrgentBookingRequests"));
const Jobs = lazy(() => import("../../views/admin/Jobs"));
const AddJob = lazy(() => import("../../views/admin/AddJob"));
const JobApplications = lazy(() => import("../../views/admin/JobApplications"));
const Achievements = lazy(() => import("../../views/admin/Achievements"));
const AddAchievement = lazy(() => import("../../views/admin/AddAchievement"));
const EditAchievement = lazy(() => import("../../views/admin/EditAchievement"));
const ImpactStats = lazy(() => import("../../views/admin/ImpactStats"));
const AddImpactStat = lazy(() => import("../../views/admin/AddImpactStat"));
const EditImpactStat = lazy(() => import("../../views/admin/EditImpactStat"));
const Clients = lazy(() => import("../../views/admin/Clients"));
const AddClient = lazy(() => import("../../views/admin/AddClient"));
const EditClient = lazy(() => import("../../views/admin/EditClient"));
const adminRoutes = [
  { path: "admin/dashboard", element: <AdminDashboard />, role: "admin" },
  { path: "admin/dashboard/categories", element: <Category />, role: "admin" },
  {
    path: "/admin/dashboard/inclusions",
    element: <Inclusion />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/edit-inclusion/:inclusionId",
    element: <Inclusion />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/edit-category/:categoryId",
    element: <Category />,
    role: "admin",
    status: "active",
  },

  {
    path: "/admin/dashboard/accommodations",
    element: <Accommodations />,
    role: "admin",
  },
  {
    path: "/admin/dashboard/edit-accommodation/:accommodationId",
    element: <Accommodations />,
    role: "admin",
    status: "active",
  },

  {
    path: "/admin/dashboard/payments",
    element: <Payments />,
    role: "admin",
    status: "active",
  },

  {
    path: "/admin/dashboard/chat-customer",
    element: <AdminToCustomer />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/chat-admin",
    element: <AdminToAdmin />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/add-trip",
    element: <AddTrip />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/customers",
    element: <Customers />,
    role: "admin",
    status: "active",
  },
  { path: "/admin/dashboard/profile", element: <Profile />, role: "admin" },
  {
    path: "/admin/dashboard/exclusions",
    element: <Exclusions />,
    role: "admin",
  },
  {
    path: "/admin/dashboard/edit-exclusion/:exclusionId",
    element: <Exclusions />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/meals",
    element: <Meals />,
    role: "admin",
  },
  {
    path: "/admin/dashboard/edit-meal/:mealId",
    element: <Meals />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/trips",
    element: <Trips />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/edit-trip/:tripId",
    element: <AddTrip />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/banner",
    element: <Banner />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/add-blog",
    element: <AddBlog />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/edit-blogPost/:blogPostId",
    element: <AddBlog />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/blogPosts",
    element: <BlogPosts />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/who-we-are",
    element: <WhoWeAre />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/PDFs",
    element: <PdfManager />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/newsletters",
    element: <Newsletter />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/newsletter/edit/:email",
    element: <Newsletter />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/admin-management",
    element: <AdminManagement />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/partners",
    element: <Partners />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/partners/add",
    element: <AddPartner />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/partners/edit/:partnerId",
    element: <EditPartner />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/reviews",
    element: <Reviews />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/safari-requests",
    element: <SafariRequests />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/urgent-booking-requests",
    element: <UrgentBookingRequests />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/jobs",
    element: <Jobs />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/add-job",
    element: <AddJob />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/edit-job/:jobId",
    element: <AddJob />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/job-applications",
    element: <JobApplications />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/achievements",
    element: <Achievements />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/achievements/add",
    element: <AddAchievement />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/achievements/edit/:achievementId",
    element: <EditAchievement />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/impact-stats",
    element: <ImpactStats />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/impact-stats/add",
    element: <AddImpactStat />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/impact-stats/edit/:impactStatId",
    element: <EditImpactStat />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/clients",
    element: <Clients />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/clients/add",
    element: <AddClient />,
    role: "admin",
    status: "active",
  },
  {
    path: "/admin/dashboard/clients/edit/:clientId",
    element: <EditClient />,
    role: "admin",
    status: "active",
  },
];

export default adminRoutes;
