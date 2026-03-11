import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Facebook,
  Globe,
  Heart,
  Home,
  Info,
  Instagram,
  Languages,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingCart,
  Star as StarIcon,
  Twitter,
  User,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaTiktok } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
];

const MobileSidebar = ({
  showSidebar,
  setShowSidebar,
  userInfo,
  pathname,
  wishlist_count,
  cart_trip_count,
  redirect_card_page,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 bg-black transition-opacity duration-300 xl:hidden ${
          showSidebar
            ? "left-80 bg-opacity-50 backdrop-blur-sm"
            : "pointer-events-none left-0 opacity-0"
        }`}
        onClick={() => setShowSidebar(false)}
      />

      <div
        className={`sidebar-content fixed bottom-0 left-0 top-0 z-[60] w-80 transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 xl:hidden ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <SidebarHeader setShowSidebar={setShowSidebar} />
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <MobileUserAuth
              userInfo={userInfo}
              setShowSidebar={setShowSidebar}
            />
            <MobileNavigation
              pathname={pathname}
              setShowSidebar={setShowSidebar}
              navigate={navigate}
            />
            <MobileCartAndWishlist
              wishlist_count={wishlist_count}
              cart_trip_count={cart_trip_count}
              userInfo={userInfo}
              setShowSidebar={setShowSidebar}
              redirect_card_page={redirect_card_page}
              navigate={navigate}
            />
            <MobileLanguageSelector />
            <MobileContactInfo />
            <MobileSocialLinks />
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarHeader = ({ setShowSidebar }) => {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <Link to="/" onClick={() => setShowSidebar(false)}>
        <img
          src="/images/zanziImage.png"
          alt="Logo"
          className="h-12 w-auto object-contain"
        />
      </Link>

      <button
        onClick={() => setShowSidebar(false)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-text transition-all hover:bg-neutral-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

const MobileUserAuth = ({ userInfo, setShowSidebar }) => {
  return (
    <div className="my-6 border-b border-neutral-200 pb-6">
      {userInfo ? (
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:bg-primary-50"
          onClick={() => setShowSidebar(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary-800">{userInfo.name}</p>
            <p className="text-xs text-text-light">View Dashboard</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text-light" />
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:bg-primary-50"
          onClick={() => setShowSidebar(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-600 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary-800">Sign In</p>
            <p className="text-xs text-text-light">Access your account</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text-light" />
        </Link>
      )}
    </div>
  );
};

const MobileLanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({
    code: "en",
    name: "English",
    flag: "🇬🇧",
    nativeName: "English",
  });

  

  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google?.translate) return

      if (document.getElementById("google-translate-script")) return;

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages.map((l) => l.code).join(","),
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element_mobile",
        );
      };
    };

    loadGoogleTranslate();
  }, []);

  const changeLanguage = (languageCode) => {
    const selectedLanguage = languages.find((l) => l.code === languageCode);
    if (selectedLanguage) {
      setCurrentLanguage(selectedLanguage);
    }
    setIsOpen(false);

    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    if (languageCode !== "en") {
      const expireDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = `googtrans=/en/${languageCode}; path=/; expires=${expireDate.toUTCString()}`;
    }

    setTimeout(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = languageCode;
        const event = new Event("change", { bubbles: true });
        select.dispatchEvent(event);
      } else {
        window.location.reload();
      }
    }, 100);
  };

  return (
    <div className="mb-6 border-b border-neutral-200 pb-6">
      <div id="google_translate_element_mobile" className="hidden" />

      <div className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-800">
          <Languages className="h-4 w-4 text-primary-600" />
          Language
        </h4>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 transition-all hover:border-primary-300 hover:bg-primary-50"
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xl"
              role="img"
              aria-label={currentLanguage.name}
            >
              {currentLanguage.flag}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-text">
                {currentLanguage.name}
              </p>
              <p className="text-xs text-text-light">
                {currentLanguage.nativeName}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-text-light transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-soft">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={(e) => {
                  e.stopPropagation();
                  changeLanguage(language.code);
                }}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all ${
                  currentLanguage.code === language.code
                    ? "bg-primary-50 text-primary-700"
                    : "text-text hover:bg-neutral-50"
                }`}
              >
                <span className="text-lg" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{language.name}</p>
                  <p className="text-xs text-text-light">
                    {language.nativeName}
                  </p>
                </div>
                {currentLanguage.code === language.code && (
                  <StarIcon className="h-4 w-4 fill-primary-600 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileNavItem = ({
  item,
  pathname,
  setShowSidebar,
  expandedMenu,
  toggleMenu,
  navigate,
}) => {
  const { categories } = useSelector((state) => state.home);

  const handleTripNavigation = (path) => {
    if (window.location.pathname === "/trips") {
      window.location.href = path;
    } else {
      navigate(path);
    }
    setShowSidebar(false);
  };

  if (item.submenu) {
    const isActive = item.submenu.some((subItem) => pathname === subItem.path);
    const isExpanded = expandedMenu === item.label;
    const IconComponent = item.icon;

    return (
      <div className="space-y-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu(item.label);
          }}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            isActive
              ? "bg-primary-50 text-primary-700"
              : "text-text hover:bg-neutral-50"
          }`}
        >
          <span className="flex items-center gap-3">
            <IconComponent className="h-5 w-5" />
            {item.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="ml-4 space-y-1 border-l-2 border-neutral-200 pl-3">
            {item.submenu.map((subItem) => {
              const isSubActive = pathname === subItem.path;
              const category = categories?.find(
                (c) => c.name === subItem.label,
              );

              return item.label === "Trips" ? (
                <button
                  key={subItem.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTripNavigation(subItem.path);
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    isSubActive
                      ? "bg-primary-50 font-medium text-primary-700"
                      : "text-text hover:bg-neutral-50"
                  }`}
                >
                  {category?.image && (
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div>{subItem.label}</div>
                    {category && (
                      <div className="text-xs text-text-light">
                        {category.trips_count || 0} tours
                      </div>
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                    isSubActive
                      ? "bg-primary-50 font-medium text-primary-700"
                      : "text-text hover:bg-neutral-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSidebar(false);
                  }}
                >
                  {subItem.icon && <subItem.icon className="h-4 w-4" />}
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const IconComponent = item.icon;

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        pathname === item.path
          ? "bg-primary-50 text-primary-700"
          : "text-text hover:bg-neutral-50"
      }`}
      onClick={() => setShowSidebar(false)}
    >
      <IconComponent className="h-5 w-5" />
      {item.label}
    </Link>
  );
};

const MobileNavigation = ({ pathname, setShowSidebar, navigate }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { categories } = useSelector((state) => state.home);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    {
      label: "Trips",
      icon: Compass,
      submenu: [
        ...(categories
          ?.map((category) => {
            const categoryId = category._id || category.id;
            if (!categoryId) {return null;}
            return {
              path: `/trips?category=${categoryId}`,
              label: category.name,
            };
          })
          .filter(Boolean) || []),
        { path: "/trips", label: "All Trips", icon: Globe },
      ],
    },
    { path: "/blog", label: "Blog", icon: BookOpen },
    { path: "/careers", label: "Career", icon: Briefcase },
    { path: "/about-us", label: "About Us", icon: Info },
    { path: "/contact-us", label: "Contact", icon: MessageCircle },
  ];

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <nav className="mb-6 space-y-1 border-b border-neutral-200 pb-6">
      {navItems.map((item) => (
        <MobileNavItem
          key={item.path || item.label}
          item={item}
          pathname={pathname}
          setShowSidebar={setShowSidebar}
          expandedMenu={expandedMenu}
          toggleMenu={toggleMenu}
          navigate={navigate}
        />
      ))}
    </nav>
  );
};

const MobileCartAndWishlist = ({
  wishlist_count,
  cart_trip_count,
  userInfo,
  setShowSidebar,
  redirect_card_page,
  navigate,
}) => {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 border-b border-neutral-200 pb-6">
      <button
        onClick={() => {
          navigate(userInfo ? "/dashboard/my-wishlist" : "/login");
          setShowSidebar(false);
        }}
        className="relative flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-secondary-300 hover:bg-secondary-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-600 text-white">
          <Heart className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-text">Wishlist</span>
        {wishlist_count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-semibold text-white">
            {wishlist_count > 99 ? "99+" : wishlist_count}
          </span>
        )}
      </button>

      <button
        onClick={() => {
          redirect_card_page();
          setShowSidebar(false);
        }}
        className="relative flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-accent-300 hover:bg-accent-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600 text-white">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-text">Cart</span>
        {cart_trip_count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
            {cart_trip_count > 99 ? "99+" : cart_trip_count}
          </span>
        )}
      </button>
    </div>
  );
};

const MobileContactInfo = () => {
  return (
    <div className="mb-6 space-y-3 border-b border-neutral-200 pb-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-800">
        <Phone className="h-4 w-4 text-primary-600" />
        Contact
      </h4>

      <div className="space-y-2">
        <a
          href="tel:+255752777701"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm transition-all hover:border-primary-300 hover:bg-primary-50"
        >
          <Phone className="h-4 w-4 text-primary-600" />
          <div>
            <p className="font-medium text-text">+255 752 777 701</p>
            <p className="text-xs text-text-light">24/7 Available</p>
          </div>
        </a>

        <a
          href="mailto:info@zanzisafaris.com"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm transition-all hover:border-primary-300 hover:bg-primary-50"
        >
          <Mail className="h-4 w-4 text-primary-600" />
          <div>
            <p className="font-medium text-text">info@zanzisafaris.com</p>
            <p className="text-xs text-text-light">Email us</p>
          </div>
        </a>

        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm">
          <MapPin className="h-4 w-4 text-primary-600" />
          <div>
            <p className="font-medium text-text">Arusha, Tanzania</p>
            <p className="text-xs text-text-light">East Africa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileSocialLinks = () => {
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-800">
        <Globe className="h-4 w-4 text-primary-600" />
        Follow Us
      </h4>

      <div className="flex flex-wrap gap-2">
        {[
          {
            icon: Facebook,
            label: "Facebook",
            href: "https://web.facebook.com/zanzitrekkingsafari",
            color: "text-[#1877F2]",
          },
          {
            icon: Twitter,
            label: "Twitter",
            href: "https://twitter.com/zanzitrekking",
            color: "text-[#1DA1F2]",
          },
          {
            icon: Instagram,
            label: "Instagram",
            href: "https://instagram.com/zanzi_trekking_safaris",
            color: "text-[#E4405F]",
          },
          {
            icon: FaTiktok,
            label: "TikTok",
            href: "https://www.tiktok.com/@zanzi_trekking_safaris",
            color: "text-black",
          },
          {
            icon: Youtube,
            label: "YouTube",
            href: "https://www.youtube.com/@Zanzi_Trekking_Safaris",
            color: "text-[#FF0000]",
          },
        ].map(({ icon: Icon, label, href, color }) => (
          <a
            key={label}
            target="_blank"
            rel="noopener noreferrer"
            href={href}
            aria-label={label}
            className={`flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition-all hover:border-neutral-300 hover:bg-neutral-50 ${color}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileSidebar;
