"use client";

import { Facebook, Instagram, Twitter, User } from "lucide-react";

const BlogWriter = ({
  authorImg,
  authorName,
  authorDetails,
  facebookLink,
  twitterLink,
  instagramLink,
}) => {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-primary p-4 sm:flex-row sm:items-start">
      <div className="flex-shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-neutral-200 sm:h-24 sm:w-24">
          <img
            src={authorImg || "/placeholder.svg"}
            alt={authorName}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-white">
              Written By
            </span>
          </div>
          <h4 className="text-xl font-bold text-white">{authorName}</h4>
        </div>
        {authorDetails && (
          <p className="text-xs leading-relaxed text-white">{authorDetails}</p>
        )}

        <div className="flex items-center gap-3">
          <a
            href={facebookLink}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            aria-label="Facebook"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Facebook size={16} />
          </a>
          <a
            href={twitterLink}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            aria-label="Twitter"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Twitter size={16} />
          </a>
          <a
            href={instagramLink}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            aria-label="Instagram"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Instagram size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogWriter;
