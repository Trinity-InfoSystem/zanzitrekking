"use client";

import { 
  ArrowRightIcon, 
  BookOpen, 
  Calendar, 
  Clock, 
  Eye, 
  Heart,
  Share2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function BlogItem({ slug, title, image, paragraph, date }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${slug}`);
  };

  // Format date if available
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      onClick={handleClick}
      className="group relative h-full cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-background-paper to-neutral-50 shadow-nature-soft transition-all duration-500 hover:scale-105 hover:shadow-nature-large"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />

        {/* Date Badge */}
        {date && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-600 px-4 py-2 text-sm font-bold text-white shadow-nature-medium backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-white" />
              {formattedDate}
            </span>
          </div>
        )}

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 hover:bg-white/30">
              <Heart className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 hover:bg-white/30">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 hover:bg-white/30">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute right-4 top-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-secondary to-accent px-3 py-1 text-xs font-bold text-white shadow-medium backdrop-blur-sm">
            <BookOpen className="h-3 w-3" />
            Article
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-6">
        <div>
          <h3 className="mb-3 line-clamp-2 text-xl font-bold text-primary transition-colors group-hover:text-secondary md:text-2xl">
            {title}
          </h3>

          <p className="mb-5 line-clamp-3 text-text-light leading-relaxed">{paragraph}</p>
        </div>

        {/* Read More Button */}
        <div className="flex items-center justify-between">
          <span className="relative inline-flex items-center font-semibold text-primary transition-all duration-300 group-hover:text-secondary">
            <span className="mr-2 transition-all duration-300 group-hover:mr-3">
              Read more
            </span>
            <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Animated underline */}
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
          </span>

          {/* Reading time estimate */}
          <div className="flex items-center gap-1 text-sm text-text-lighter">
            <Clock className="h-4 w-4" />
            <span>5 min read</span>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-to-r from-secondary/30 to-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute bottom-4 left-4 h-1 w-1 rounded-full bg-gradient-to-r from-primary/30 to-success/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export default BlogItem;
