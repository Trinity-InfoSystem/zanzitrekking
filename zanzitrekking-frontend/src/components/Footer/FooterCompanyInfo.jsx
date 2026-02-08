import { Link } from "react-router-dom";
import {
  Compass,
  Facebook,
  Instagram,
  Sparkles,
  Twitter,
  Youtube,
} from "lucide-react";
import SocialIcon from "./SocialIcon";
import { FaTiktok } from "react-icons/fa";

const FooterCompanyInfo = () => {
  return (
    <div className="lg:col-span-1">
      <Link to="/" className="group mb-8 inline-block">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <img
            src="/images/zanziImage.png"
            alt="Zanzi Trekking and Safaris"
            className="h-20 w-auto"
          />
        </div>
      </Link>

      <div className="mb-8 space-y-4">
        <p className="text-sm leading-relaxed text-text-light">
          Discover the untamed beauty of Tanzania with authentic safari
          experiences that create memories to last a lifetime.
        </p>

        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 px-4 py-2.5 shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <div className="text-xs">
            <span className="font-semibold text-primary-700">Since 2010</span>
            <span className="mx-2 text-neutral-400">•</span>
            <span className="text-neutral-600">1,000+ Expeditions</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Connect With Us
        </h4>
        <div className="flex gap-2.5">
          <SocialIcon
            icon={<Facebook size={18} />}
            label="Facebook"
            href="https://web.facebook.com/zanzitrekkingsafari"
          />
          <SocialIcon
            icon={<Twitter size={18} />}
            label="Twitter"
            href="https://twitter.com/zanzitrekking"
          />
          <SocialIcon
            icon={<Instagram size={18} />}
            label="Instagram"
            href="https://instagram.com/zanzi_trekking_safaris"
          />
          <SocialIcon
            icon={<FaTiktok size={18} />}
            label="Tiktok"
            href="https://www.tiktok.com/@zanzi_trekking_safaris?_t=8bXruen95du&_r=1&fbclid=PAAaYumv1HkM7p_DCS4InlNG14tWwpjtOIafg39NlxjvBKFKlQ4t7zvLfNv2A"
          />
          <SocialIcon
            icon={<Youtube size={18} />}
            label="Youtube"
            href="https://www.youtube.com/@Zanzi_Trekking_Safaris"
          />
        </div>
      </div>
    </div>
  );
};

export default FooterCompanyInfo;
