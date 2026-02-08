import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, Camera, Compass, FileText, Mail } from "lucide-react";

const FooterQuickLinks = () => {
  const links = [
    {
      href: "/about-us",
      text: "About Us",
      icon: <Compass className="h-4 w-4" />,
    },
    {
      href: "/trips",
      text: "Safari Trips",
      icon: <Camera className="h-4 w-4" />,
    },
    {
      href: "/contact-us",
      text: "Contact Us",
      icon: <Mail className="h-4 w-4" />,
    },
    { href: "/blog", text: "Blog", icon: <FileText className="h-4 w-4" /> },
    { href: "/jobs", text: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
          <Compass className="h-4.5 w-4.5 text-primary-600" />
        </div>
        <h3 className="text-base font-semibold text-text-dark">Quick Links</h3>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-light transition-all duration-300 hover:bg-neutral-100 hover:text-primary-600"
          >
            <span className="text-neutral-400 transition-colors group-hover:text-primary-600">
              {link.icon}
            </span>
            <span>{link.text}</span>
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="mt-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 shadow-lg">
        <h4 className="mb-2 text-sm font-semibold text-white">
          Ready to Explore?
        </h4>
        <p className="mb-4 text-xs text-primary-100">
          Discover your perfect Tanzania adventure
        </p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-primary-700 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <span>View All Trips</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default FooterQuickLinks;
