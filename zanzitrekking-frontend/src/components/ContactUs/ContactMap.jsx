"use client";

import { MapPin } from "lucide-react";

const ContactMap = () => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="h-full">
        <iframe
          title="Office Location"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3982.9521255482655!2d36.700281!3d-3.361874!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18371b4fa56ea61d%3A0x1f26366a01fc5c4d!2sZanzi%20Trekking%20and%20Safaris!5e0!3m2!1sen!2stz!4v1735051111085!5m2!1sen!2stz"
          className="h-full min-h-[400px] w-full"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Overlay with office info */}
      <div className="absolute left-4 top-4 rounded-lg border border-neutral-200 bg-white/95 p-4 shadow-md backdrop-blur-sm">
        <div className="mb-1.5 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-600" />
          <span className="font-semibold text-neutral-900">
            Zanzi Trekking & Safaris
          </span>
        </div>
        <p className="text-sm text-neutral-600">Simeon Road, Arusha 23101</p>
      </div>
    </div>
  );
};

export default ContactMap;
