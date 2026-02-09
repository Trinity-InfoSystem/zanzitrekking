import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import {
  FaBlogger,
  FaBloggerB,
  FaSafari,
  FaStar,
  FaUsers,
  FaPlus,
} from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { IoChatbubble, IoMail } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { GiCrossMark, GiMeal } from "react-icons/gi";
import { ImCheckmark2 } from "react-icons/im";
import { SiHotelsdotcom, SiTripdotcom } from "react-icons/si";
import { RiHotelBedFill } from "react-icons/ri";
import { IoImagesSharp } from "react-icons/io5";
import {
  FaFilePdf,
  FaPeopleGroup,
  FaUserShield,
  FaHandshake,
  FaClipboardList,
  FaBriefcase,
  FaFileLines,
  FaTriangleExclamation,
  FaQrcode,
} from "react-icons/fa6";

export const allNav = [
  {
    id: 1,
    title: "Dashboard",
    icon: <AiOutlineDashboard />,
    path: "/admin/dashboard",
    onlyAdmin: false,
  },
  {
    id: 2,
    title: "Category",
    icon: <BiCategory />,
    path: ["/admin/dashboard/categories", "/admin/dashboard/edit-category/"],
    onlyAdmin: false,
  },
  {
    id: 3,
    title: "Customers",
    icon: <FaUsers />,
    path: "/admin/dashboard/customers",
    onlyAdmin: false,
  },
  {
    id: 4,
    title: "Payments",
    icon: <MdPayment />,
    path: "/admin/dashboard/payments",
    onlyAdmin: false,
  },
  {
    id: 4.1,
    title: "QR Code Scanner",
    icon: <FaQrcode />,
    path: "/admin/dashboard/qr-scanner",
    onlyAdmin: false,
  },
  {
    id: 4.5, // or 22 if you want it at the end
    title: "Safari Requests",
    icon: <FaClipboardList />,
    path: "/admin/dashboard/safari-requests",
    onlyAdmin: false,
  },
  {
    id: 4.6,
    title: "Urgent Booking Requests",
    icon: <FaTriangleExclamation />,
    path: "/admin/dashboard/urgent-booking-requests",
    onlyAdmin: false,
  },
  {
    id: 5,
    title: "Chat-Customer",
    icon: <IoChatbubble />,
    path: "/admin/dashboard/chat-customer",
    onlyAdmin: false,
  },
  {
    id: 5.5,
    title: "Chat-Admin",
    icon: <IoChatbubble />,
    path: "/admin/dashboard/chat-admin",
    onlyAdmin: true,
  },
  {
    id: 6,
    title: "Profile",
    icon: <CgProfile />,
    path: "/admin/dashboard/profile",
    onlyAdmin: false,
  },
  // Grouping related items together (Inclusions & Exclusions)
  {
    id: 7,
    title: "Inclusions",
    icon: <ImCheckmark2 />,
    path: ["/admin/dashboard/inclusions", "/admin/dashboard/edit-inclusion"],
    onlyAdmin: false,
  },
  {
    id: 8,
    title: "Exclusions",
    icon: <GiCrossMark />,
    path: ["/admin/dashboard/exclusions", "/admin/dashboard/edit-exclusion"],
    onlyAdmin: false,
  },
  // Grouping trip-related items together
  {
    id: 9,
    title: "Add Trip",
    icon: <SiTripdotcom />,
    path: "/admin/dashboard/add-trip",
    onlyAdmin: true,
  },
  {
    id: 10,
    title: "Trips",
    icon: <FaSafari />,
    path: "/admin/dashboard/trips",
    onlyAdmin: false,
  },
  {
    id: 11,
    title: "Reviews",
    icon: <FaStar />,
    path: "/admin/dashboard/reviews",
    onlyAdmin: false,
  },
  {
    id: 12,
    title: "Accommodations",
    icon: <RiHotelBedFill />,
    path: [
      "/admin/dashboard/accommodations",
      "/admin/dashboard/edit-accommodation",
    ],
    onlyAdmin: false,
  },
  {
    id: 13,
    title: "Meals",
    icon: <GiMeal />,
    path: ["/admin/dashboard/meals", "/admin/dashboard/edit-meal"],
    onlyAdmin: false,
  },
  // Banner management
  {
    id: 14,
    title: "Banner",
    icon: <IoImagesSharp />,
    path: "/admin/dashboard/banner",
    onlyAdmin: false,
  },
  {
    id: 15,
    title: "Add Blog Post",
    icon: <FaBlogger />,
    path: "/admin/dashboard/add-blog",
    onlyAdmin: true,
  },
  {
    id: 16,
    title: "Blog Posts",
    icon: <FaBloggerB />,
    path: "/admin/dashboard/blogPosts",
    onlyAdmin: false,
  },
  {
    id: 17,
    title: "Who We Are",
    icon: <FaPeopleGroup />,
    path: "/admin/dashboard/who-we-are",
    onlyAdmin: false,
  },
  {
    id: 18,
    title: "PDF Manager",
    icon: <FaFilePdf />,
    path: "/admin/dashboard/PDFs",
    onlyAdmin: false,
  },
  {
    id: 19,
    title: "Newsletter",
    icon: <IoMail />,
    path: "/admin/dashboard/newsletters",
    onlyAdmin: false,
  },
  {
    id: 20,
    title: "Partners",
    icon: <FaHandshake />,
    path: [
      "/admin/dashboard/partners",
      "/admin/dashboard/partners/add",
      "/admin/dashboard/partners/edit",
    ],
    onlyAdmin: false,
  },
  {
    id: 21,
    title: "Admin Management",
    icon: <FaUserShield />,
    path: "/admin/dashboard/admin-management",
    onlyAdmin: true,
  },
  {
    id: 22,
    title: "Careers",
    icon: <FaBriefcase />,
    path: "/admin/dashboard/jobs",
    onlyAdmin: false,
  },
  {
    id: 22.5,
    title: "Add Career",
    icon: <FaPlus />,
    path: "/admin/dashboard/add-job",
    onlyAdmin: false,
  },
  {
    id: 23,
    title: "Career Applications",
    icon: <FaFileLines />,
    path: "/admin/dashboard/job-applications",
    onlyAdmin: false,
  },
  {
    id: 24,
    title: "Achievements",
    icon: <FaStar />,
    path: [
      "/admin/dashboard/achievements",
      "/admin/dashboard/achievements/add",
      "/admin/dashboard/achievements/edit",
    ],
    onlyAdmin: false,
  },
  {
    id: 25,
    title: "Impact Stats",
    icon: <FaBriefcase />,
    path: [
      "/admin/dashboard/impact-stats",
      "/admin/dashboard/impact-stats/add",
      "/admin/dashboard/impact-stats/edit",
    ],
    onlyAdmin: false,
  },
  {
    id: 26,
    title: "Clients",
    icon: <FaHandshake />,
    path: [
      "/admin/dashboard/clients",
      "/admin/dashboard/clients/add",
      "/admin/dashboard/clients/edit",
    ],
    onlyAdmin: false,
  },
];
