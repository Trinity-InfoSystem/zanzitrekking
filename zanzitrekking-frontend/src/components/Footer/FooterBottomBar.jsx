import { Award, FileText, Globe, Heart, Shield } from "lucide-react";

const FooterBottomBar = () => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { href: "/cookie-policy", label: "Cookie Policy", icon: Globe },
  ];

  return (
    <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-8 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          {/* Left side - Company info */}
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <div className="flex items-center gap-2 text-sm text-text-light">
              <span>© {currentYear} Safari Adventures Tanzania.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5">
              <Award className="h-3.5 w-3.5 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">
                Licensed Tour Operator
              </span>
            </div>
          </div>

          {/* Center - Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {legalLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={index}
                  href={link.href}
                  className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-text-light transition-all duration-300 hover:bg-white hover:text-primary-600 hover:shadow-sm"
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Right side - Made with love */}
          <div className="flex flex-col items-center gap-2 lg:items-end">
            <div className="flex items-center gap-2 text-sm text-text-light">
              <span>Crafted with</span>
              <Heart className="h-4 w-4 fill-secondary-500 text-secondary-500" />
              <span>in Tanzania</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-lighter">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterBottomBar;
