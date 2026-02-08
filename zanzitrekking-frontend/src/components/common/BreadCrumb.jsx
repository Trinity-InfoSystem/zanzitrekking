import { ChevronRight } from "lucide-react";

import { Link } from "react-router-dom";

export default function BreadCrumb({ title }) {
  return (
    <section className="relative h-[300px] overflow-hidden md:h-[350px] lg:h-[400px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/images/banner/shop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}

      <div className="absolute inset-0">
        <div className="h-full px-4 md:px-12">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 md:text-base">
              <Link to="/" className="transition-colors hover:text-emerald-400">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>{title}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
