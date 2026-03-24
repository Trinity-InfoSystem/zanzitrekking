import {
  BookOpen,
  Briefcase,
  ChevronDown,
  Compass,
  Heart,
  Home,
  Info,
  Mail,
  Map,
  Menu,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { resolveMediaUrl } from "../../utils/imageUtils";

const MainHeader = ({
  isScrolled,
  showTopBar,
  pathname,
  userInfo,
  wishlist_count,
  cart_trip_count,
  setShowSidebar,
  setShowSearchBar,
  redirect_card_page,
  containerRef,
}) => {
  // CONTROL THE GAP BETWEEN ALL THREE SECTIONS HERE
  const sectionGap = "gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 tablet:gap-5 lg:gap-6 xl:gap-10"; // <-- Responsive gap control

  return (
    <div
      ref={containerRef}
      className={`fixed left-0 right-0 z-40 w-full border-b border-neutral-200 bg-white backdrop-blur-sm transition-all duration-300 ease-in-out ${showTopBar ? "tablet:top-[28px]" : "tablet:top-0"} top-0 shadow-sm`}
    >
      <div className="px-3 xs:px-4 sm:px-5 md:px-6 tablet:px-7 lg:px-8 xl:px-12">
        <div
          className={`mx-auto flex max-w-[1400px] items-center justify-between tablet:justify-center transition-all duration-300 ${sectionGap} ${isScrolled ? "py-1.5 xs:py-2 sm:py-2 md:py-2.5 tablet:py-2" : "py-2.5 xs:py-3 sm:py-3 md:py-3.5 tablet:py-4"}`}
        >
          {/* SECTION 1: Logo */}
          <EnhancedLogoAndMobileMenu
            setShowSidebar={setShowSidebar}
            isScrolled={isScrolled}
          />

          {/* SECTION 2: Navigation */}
          <EnhancedDesktopNavigation pathname={pathname} />

          {/* SECTION 3: Actions */}
          <EnhancedHeaderActions
            setShowSearchBar={setShowSearchBar}
            userInfo={userInfo}
            wishlist_count={wishlist_count}
            cart_trip_count={cart_trip_count}
            redirect_card_page={redirect_card_page}
          />
        </div>
      </div>
    </div>
  );
};

const EnhancedLogoAndMobileMenu = ({ setShowSidebar, isScrolled }) => {
  return (
    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 flex-shrink-0 min-w-0">
      {/* Mobile menu button - Show only below tablet breakpoint (< 817px) */}
      <button
        onClick={() => setShowSidebar(true)}
        className="group rounded-lg border border-neutral-300 bg-white p-1.5 xs:p-2 flex-shrink-0 text-neutral-900 transition-all hover:border-neutral-900 hover:bg-neutral-900 tablet:hidden"
        aria-label="Menu"
      >
        <Menu className="h-4 w-4 xs:h-5 xs:w-5 transition-colors group-hover:text-white" />
      </button>

      <Link to="/" className="group relative flex-shrink-0 min-w-0">
        <div className="relative">
          <img
            src="/images/newZanzi.jpg"
            alt="Zanzi Trekking and Safaris"
            className={`rounded-lg object-contain transition-all duration-300 group-hover:scale-105 ${isScrolled ? "h-9 xs:h-10 sm:h-11 md:h-12 tablet:h-12" : "h-10 xs:h-11 sm:h-12 md:h-[52px] tablet:h-14"}`}
          />
        </div>
      </Link>
    </div>
  );
};

const EnhancedDesktopNavigation = ({ pathname }) => {
  const { categories, totalTrips } = useSelector((state) => state.home);
  const navigate = useNavigate();

  const handleTripNavigation = (path) => {
    if (window.location.pathname === "/trips") {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  const getTotalTripsCount = () => {
    if (totalTrips && totalTrips > 0) {
      return totalTrips;
    }
    if (!categories || !Array.isArray(categories)) {return 0;}
    return categories.reduce(
      (total, category) => total + (category.trips_count || 0),
      0,
    );
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    {
      label: "Trips",
      icon: Compass,
      submenu: [
        {
          path: "/trips",
          label: "All Trips",
          icon: Map,
          description: "Explore all adventures",
          onClick: () => handleTripNavigation("/trips"),
        },
        ...(categories
          ?.map((category) => {
            const categoryId = category._id || category.id;
            if (!categoryId) {return null;}
            return {
              path: `/trips?category=${categoryId}`,
              label: category.name,
              image: category.image,
              trips_count: category.trips_count,
              onClick: () =>
                handleTripNavigation(`/trips?category=${categoryId}`),
            };
          })
          .filter(Boolean) || []),
      ],
    },
    {
      path: "/blog",
      label: "Blog",
      icon: BookOpen,
    },
    { path: "/careers", label: "Career", icon: Briefcase },
    { path: "/about-us", label: "About", icon: Info },
    { path: "/contact-us", label: "Contact", icon: Mail },
  ];

  return (
    <nav className="hidden items-center tablet:flex">
      {navItems.map((item, index) =>
        item.submenu ? (
          <EnhancedNavItemWithSubmenu
            key={index}
            item={item}
            pathname={pathname}
            totalTripsCount={getTotalTripsCount()}
          />
        ) : (
          <EnhancedNavLink
            key={index}
            path={item.path}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.path}
            external={item.external}
          />
        ),
      )}
    </nav>
  );
};

const EnhancedNavItemWithSubmenu = ({ item, pathname, totalTripsCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isTripsDropdown = item.label === "Trips";
  const isActive = pathname.includes("trips");

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`group relative flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 tablet:gap-1.5 tablet:px-2.5 tablet:py-2 tablet:text-[12px] lg:px-3 lg:text-[13px] xl:px-3.5 xl:text-[15px] ${
          isActive
            ? "bg-neutral-100 text-neutral-900"
            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
        }`}
      >
        <item.icon className="h-[14px] w-[14px] transition-transform group-hover:scale-110 tablet:h-[15px] tablet:w-[15px] lg:h-[16px] lg:w-[16px] xl:h-[18px] xl:w-[18px]" />
        <span className="whitespace-nowrap">{item.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-all duration-200 tablet:h-3.5 tablet:w-3.5 lg:h-4 lg:w-4 ${isOpen ? "rotate-180" : ""} ${isActive ? "text-neutral-900" : "text-neutral-500"}`}
        />
        {isActive && (
          <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-neutral-900 tablet:w-8 lg:w-10 xl:w-12"></span>
        )}
      </button>

      <div
        className={`absolute left-0 top-full mt-1.5 tablet:mt-2 w-[280px] tablet:w-72 origin-top-left rounded-xl border border-neutral-200 bg-white shadow-xl transition-all duration-200 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {item.submenu.map((subItem, subIndex) => (
            <div key={subIndex}>
              {subItem.image ? (
                <button
                  onClick={subItem.onClick}
                  className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-neutral-50"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-neutral-200 transition-all group-hover:shadow-md group-hover:ring-neutral-300">
                    <img
                      src={resolveMediaUrl(subItem.image)}
                      alt={subItem.label}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-neutral-900 group-hover:text-neutral-900">
                      {subItem.label}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Map className="h-3 w-3" />
                      <span>{subItem.trips_count || 0} Tours</span>
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  to={subItem.path}
                  onClick={subItem.onClick}
                  className="group flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-neutral-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-neutral-900">
                    <subItem.icon className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {subItem.label}
                    </div>
                    {subItem.description && (
                      <div className="text-xs text-neutral-500">
                        {subItem.description}
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {isTripsDropdown && (
          <div className="border-t border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-neutral-600" />
                <span className="text-xs font-semibold text-neutral-700">
                  {totalTripsCount} Adventures
                </span>
              </div>
              <Link
                to="/trips"
                className="group flex items-center gap-1 text-xs font-semibold text-neutral-900 transition-all hover:gap-2"
              >
                <span>View All</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedNavLink = ({
  path,
  label,
  icon: IconComponent,
  isActive,
  external,
}) => {
  const className = `group relative flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 tablet:gap-1.5 tablet:px-2.5 tablet:py-2 tablet:text-[12px] lg:gap-2 lg:px-3 lg:text-[13px] xl:gap-3 xl:px-3.5 xl:text-[16px] ${
    isActive
      ? "bg-neutral-100 text-neutral-900"
      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
  }`;

  const content = (
    <>
      <IconComponent className="h-[14px] w-[14px] transition-transform group-hover:scale-110 tablet:h-[15px] tablet:w-[15px] lg:h-[16px] lg:w-[16px] xl:h-[18px] xl:w-[18px]" />
      <span className="whitespace-nowrap">{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-neutral-900 tablet:w-8 lg:w-10 xl:w-12"></span>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={path} className={className}>
      {content}
    </Link>
  );
};

const EnhancedHeaderActions = ({
  setShowSearchBar,
  userInfo,
  wishlist_count,
  cart_trip_count,
  redirect_card_page,
}) => {
  return (
    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 tablet:gap-2.5 lg:gap-3 flex-shrink-0">
      <EnhancedSearchToggleButton setShowSearchBar={setShowSearchBar} />
      <EnhancedWishlistButton
        userInfo={userInfo}
        wishlist_count={wishlist_count}
      />
      <EnhancedCartButton
        cart_trip_count={cart_trip_count}
        redirect_card_page={redirect_card_page}
      />
      <EnhancedWhatsAppButton />
    </div>
  );
};

const EnhancedSearchToggleButton = ({ setShowSearchBar }) => {
  return (
    <button
      onClick={() => setShowSearchBar((prev) => !prev)}
      className="group rounded-lg border border-neutral-300 bg-white p-1.5 xs:p-2 text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-sm tablet:p-2 lg:p-2.5"
      aria-label="Search"
    >
      <Search className="h-3.5 w-3.5 xs:h-4 xs:w-4 transition-transform group-hover:scale-110 tablet:h-[17px] tablet:w-[17px] lg:h-[18px] lg:w-[18px]" />
    </button>
  );
};

const EnhancedWishlistButton = ({ userInfo, wishlist_count }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(userInfo ? "/dashboard/my-wishlist" : "/login")}
      className="group relative rounded-lg border border-neutral-300 bg-white p-1.5 xs:p-2 text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-sm tablet:p-2 lg:p-2.5"
      aria-label="Wishlist"
    >
      <Heart className="h-3.5 w-3.5 xs:h-4 xs:w-4 transition-all group-hover:scale-110 group-hover:fill-red-500 group-hover:text-red-500 tablet:h-[17px] tablet:w-[17px] lg:h-[18px] lg:w-[18px]" />
      {wishlist_count > 0 && (
        <span className="absolute -right-1 -top-1 xs:-right-1.5 xs:-top-1.5 flex h-4 w-4 xs:h-5 xs:w-5 min-w-[16px] xs:min-w-[20px] items-center justify-center rounded-full bg-neutral-900 text-[9px] xs:text-[10px] font-bold text-white shadow-md ring-1 xs:ring-2 ring-white">
          {wishlist_count > 99 ? "99+" : wishlist_count}
        </span>
      )}
    </button>
  );
};

const EnhancedCartButton = ({ cart_trip_count, redirect_card_page }) => {
  return (
    <button
      onClick={redirect_card_page}
      className="group relative rounded-lg border border-neutral-300 bg-white p-1.5 xs:p-2 text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-sm tablet:p-2 lg:p-2.5"
      aria-label="Cart"
    >
      <ShoppingCart className="h-3.5 w-3.5 xs:h-4 xs:w-4 transition-transform group-hover:scale-110 tablet:h-[17px] tablet:w-[17px] lg:h-[18px] lg:w-[18px]" />
      {cart_trip_count > 0 && (
        <span className="absolute -right-1 -top-1 xs:-right-1.5 xs:-top-1.5 flex h-4 w-4 xs:h-5 xs:w-5 min-w-[16px] xs:min-w-[20px] items-center justify-center rounded-full bg-neutral-900 text-[9px] xs:text-[10px] font-bold text-white shadow-md ring-1 xs:ring-2 ring-white">
          {cart_trip_count > 99 ? "99+" : cart_trip_count}
        </span>
      )}
    </button>
  );
};

const EnhancedWhatsAppButton = () => {
  const whatsappNumber = "255752777701";
  const whatsappMessage =
    "Hello! I'd like to inquire about your trekking and safari packages.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center overflow-hidden rounded-lg border border-[#25D366]/30 bg-gradient-to-br from-[#25D366] to-[#20BA5A] p-1.5 xs:p-2 shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 tablet:p-2 lg:p-2.5"
      aria-label="Contact us on WhatsApp"
    >
      <div className="flex h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-white transition-transform group-hover:scale-110 tablet:h-[17px] tablet:w-[17px] lg:h-[18px] lg:w-[18px]"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
      <span className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity group-hover:opacity-10"></span>
    </a>
  );
};

export default MainHeader;
