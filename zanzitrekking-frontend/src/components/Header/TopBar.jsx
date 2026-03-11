import {
  Check,
  ChevronDown,
  Facebook,
  Globe,
  Instagram,
  Lock,
  Mail,
  Phone,
  Twitter,
  User,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";
import CookieConsentBanner from "./CookieConsentBanner";
import { useDispatch, useSelector } from "react-redux";
import { get_conpany_info } from "../../store/reducers/authReducer";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const languages = [
  {
    code: "en",
    name: "EN",
    flag: "https://flagcdn.com/w40/gb.png",
    fullName: "English",
  },
  {
    code: "es",
    name: "ES",
    flag: "https://flagcdn.com/w40/es.png",
    fullName: "Español",
  },
  {
    code: "fr",
    name: "FR",
    flag: "https://flagcdn.com/w40/fr.png",
    fullName: "Français",
  },
  {
    code: "de",
    name: "DE",
    flag: "https://flagcdn.com/w40/de.png",
    fullName: "Deutsch",
  },
  {
    code: "it",
    name: "IT",
    flag: "https://flagcdn.com/w40/it.png",
    fullName: "Italiano",
  },
  {
    code: "pt",
    name: "PT",
    flag: "https://flagcdn.com/w40/pt.png",
    fullName: "Português",
  },
  {
    code: "ru",
    name: "RU",
    flag: "https://flagcdn.com/w40/ru.png",
    fullName: "Русский",
  },
  {
    code: "zh-CN",
    name: "CN",
    flag: "https://flagcdn.com/w40/cn.png",
    fullName: "中文",
  },
  {
    code: "ja",
    name: "JP",
    flag: "https://flagcdn.com/w40/jp.png",
    fullName: "日本語",
  },
  {
    code: "ko",
    name: "KR",
    flag: "https://flagcdn.com/w40/kr.png",
    fullName: "한국어",
  },
  {
    code: "ar",
    name: "AR",
    flag: "https://flagcdn.com/w40/sa.png",
    fullName: "العربية",
  },
  {
    code: "hi",
    name: "HI",
    flag: "https://flagcdn.com/w40/in.png",
    fullName: "हिन्दी",
  },
];

const TopBar = ({ userInfo, showTopBar }) => {
  const dispatch = useDispatch();
  const { companyInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(get_conpany_info());
  }, []);

  return (
    <>
      <div
        className={`fixed left-0 right-0 top-0 z-50 hidden border-b border-neutral-200 bg-white transition-transform duration-300 ease-in-out tablet:block ${
          showTopBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-4 md:px-12">
          <div className="flex h-7 items-center justify-between">
            {/* Left side - Contact Info */}
            <div className="flex items-center gap-4">
              <a
                href="tel:+255752777701"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <Phone className="h-3 w-3" />
                <span>+255 752 777 701</span>
              </a>
              <div className="h-3 w-px bg-neutral-300" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const email = "info@zanzisafaris.com";
                  navigator.clipboard.writeText(email).then(() => {
                    toast.success(`Email copied: ${email}`);
                  }).catch(() => {
                    toast.error("Failed to copy email");
                  });
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                title="Click to copy email"
              >
                <Mail className="h-3 w-3" />
                <span>info@zanzisafaris.com</span>
              </button>
            </div>

            {/* Right side - Social, Language & Auth */}
            <div className="flex items-center gap-4">
              <SocialLinks />
              <div className="h-3 w-px bg-neutral-300" />
              <LanguageSelector />
              {!userInfo && (
                <>
                  <div className="h-3 w-px bg-neutral-300" />
                  <UserAuthLink userInfo={userInfo} />
                </>
              )}
              {userInfo && (
                <>
                  <div className="h-3 w-px bg-neutral-300" />
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    <User className="h-3 w-3" />
                    <span>{userInfo.name}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CookieConsentBanner />
    </>
  );
};

const SocialLinks = () => {
  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/people/Zanzi-Trekking-Safaris/100092512366326/",
      label: "Facebook",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/zanzi.safaris/",
      label: "Instagram",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/@zanzitrekkingsafaris",
      label: "YouTube",
    },
    {
      icon: FaTiktok,
      href: "https://www.tiktok.com/@zanzitrekkingsafaris",
      label: "TikTok",
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 transition-colors hover:text-neutral-900"
            aria-label={social.label}
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        );
      })}
    </div>
  );
};

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({
    code: "en",
    name: "EN",
    flag: "https://flagcdn.com/w40/gb.png",
    fullName: "English",
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    const getLanguageFromCookie = () => {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("googtrans="))
        ?.split("=")[1];

      if (cookieValue) {
        const langCode = cookieValue.split("/")[2];
        const selectedLanguage = languages.find((l) => l.code === langCode);
        if (selectedLanguage) {
          setCurrentLanguage(selectedLanguage);
        }
      }
    };

    getLanguageFromCookie();
  }, []);

  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google?.translate) return;

      if (document.getElementById("google-translate-script")) return;

      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: languages.map((l) => l.code).join(","),
              layout:
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      document.body.appendChild(script);
    };

    loadGoogleTranslate();
  }, []);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 224;

      let leftPosition = rect.left;

      if (leftPosition + dropdownWidth > viewportWidth - 24) {
        leftPosition = viewportWidth - dropdownWidth - 24;
      }

      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(24, leftPosition),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen]);

  const changeLanguage = (languageCode) => {
    setIsTranslating(true);
    setIsOpen(false);

    const selectedLanguage = languages.find((l) => l.code === languageCode);
    if (selectedLanguage) {
      setCurrentLanguage(selectedLanguage);
    }

    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    if (languageCode !== "en") {
      const expireDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = `googtrans=/en/${languageCode}; path=/; expires=${expireDate.toUTCString()}`;
    }

    setTimeout(() => {
      try {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = languageCode;
          const event = new Event("change", { bubbles: true });
          select.dispatchEvent(event);

          setTimeout(() => {
            setIsTranslating(false);
          }, 1000);
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error changing language:", error);
        setIsTranslating(false);
      }
    }, 100);
  };

  return (
    <>
      <div
        id="google_translate_element"
        style={{ display: "none", position: "absolute", left: "-9999px" }}
      />

      <div className="relative">
        <button
          ref={buttonRef}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 disabled:opacity-50"
          onClick={() => !isTranslating && setIsOpen(!isOpen)}
          onMouseEnter={() => !isTranslating && setIsOpen(true)}
          onMouseMove={() => isOpen && updateDropdownPosition()}
          type="button"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          ) : (
            <>
              <img
                src={currentLanguage.flag}
                alt={currentLanguage.fullName}
                className="h-4 w-5 rounded-sm object-cover"
              />
            </>
          )}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen &&
        !isTranslating &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />
            <div
              className="notranslate fixed w-56 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl"
              style={{
                zIndex: 99999,
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-neutral-600" />
                  <span className="text-xs font-semibold text-neutral-900">
                    Select Language
                  </span>
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    className={`flex w-full items-center gap-2.5 rounded px-3 py-2 text-left transition-all ${
                      currentLanguage.code === language.code
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                    onClick={() => changeLanguage(language.code)}
                    type="button"
                  >
                    <img
                      src={language.flag}
                      alt={language.fullName}
                      className="h-4 w-5 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">
                        {language.fullName}
                      </div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="h-3 w-3 flex-shrink-0 text-neutral-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

const UserAuthLink = ({ userInfo }) => {
  return (
    <Link
      to="/login"
      className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900"
    >
      <Lock className="h-3 w-3" />
      <span>Sign In</span>
    </Link>
  );
};

export default TopBar;
