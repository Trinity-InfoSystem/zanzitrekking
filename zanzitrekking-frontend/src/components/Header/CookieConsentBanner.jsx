import { useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  Cookie,
  Settings,
  Shield,
  Target,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookies, setCookies] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    } else if (consent === "custom") {
      const storedPreferences = localStorage.getItem("cookiePreferences");
      if (storedPreferences) {
        try {
          setCookies(JSON.parse(storedPreferences));
        } catch (e) {
          console.error("Error parsing cookie preferences:", e);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookieConsent", "all");
    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
    setCookies(newPreferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem("cookieConsent", "necessary");
    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
    setCookies(newPreferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    const consent =
      cookies.analytics || cookies.marketing ? "custom" : "necessary";
    localStorage.setItem("cookieConsent", consent);
    localStorage.setItem("cookiePreferences", JSON.stringify(cookies));
    setShowBanner(false);
    setShowSettings(false);
  };

  const toggleCookie = (type) => {
    if (type === "necessary") {return;}
    setCookies((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  if (!showBanner) {return null;}

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp">
      <div className="border-t border-white/20 bg-white/80 shadow-soft-xl backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {!showSettings ? (
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-100 to-accent-200">
                  <Cookie className="h-6 w-6 text-accent-700" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-bold text-primary-800">
                    We Value Your Privacy
                  </h3>
                  <p className="text-sm leading-relaxed text-text-light">
                    We use cookies to enhance your browsing experience and
                    analyze our traffic. By clicking &quot;Accept All&quot;, you consent
                    to our use of cookies.{" "}
                    <Link
                      to="/cookie-policy"
                      className="font-medium text-primary-600 underline decoration-primary-300 underline-offset-2 transition-colors hover:text-primary-700 hover:decoration-primary-500"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-text backdrop-blur-sm transition-all hover:border-primary-300 hover:bg-primary-50/80"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </button>
                <button
                  onClick={handleRejectAll}
                  className="rounded-lg border border-neutral-200/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-text backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-neutral-50/80"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                >
                  <Check className="h-4 w-4" />
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                    <Settings className="h-5 w-5 text-primary-700" />
                  </div>
                  <h3 className="text-lg font-bold text-primary-800">
                    Cookie Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-light transition-all hover:bg-neutral-100/60 hover:text-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <CookieOption
                  icon={Shield}
                  title="Necessary Cookies"
                  description="Essential for the website to function properly. These cannot be disabled."
                  checked={cookies.necessary}
                  disabled={true}
                  onChange={() => {}}
                  iconColor="text-primary-600"
                  bgColor="bg-primary-50"
                />

                <CookieOption
                  icon={BarChart3}
                  title="Analytics Cookies"
                  description="Help us understand how visitors interact with our website by collecting anonymous data."
                  checked={cookies.analytics}
                  disabled={false}
                  onChange={() => toggleCookie("analytics")}
                  iconColor="text-secondary-600"
                  bgColor="bg-secondary-50"
                />

                <CookieOption
                  icon={Target}
                  title="Marketing Cookies"
                  description="Used to track visitors across websites for advertising and promotional purposes."
                  checked={cookies.marketing}
                  disabled={false}
                  onChange={() => toggleCookie("marketing")}
                  iconColor="text-accent-600"
                  bgColor="bg-accent-50"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200/40 pt-4">
                <button
                  onClick={handleRejectAll}
                  className="rounded-lg border border-neutral-200/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-text backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-neutral-50/80"
                >
                  Reject All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md"
                >
                  <Check className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CookieOption = ({
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onChange,
  iconColor,
  bgColor,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200/60 bg-white/60 p-4 backdrop-blur-sm transition-all hover:border-primary-200 hover:bg-white/80 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgColor}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-semibold text-primary-800">
            {title}
          </h4>
          <p className="text-xs leading-relaxed text-text-light">
            {description}
          </p>
        </div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
        />
        <div
          className={`h-6 w-11 rounded-full bg-neutral-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-soft after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${!disabled && "peer-hover:bg-neutral-300 peer-checked:peer-hover:bg-primary-700"}`}
        ></div>
      </label>
    </div>
  );
};

export default CookieConsentBanner;
