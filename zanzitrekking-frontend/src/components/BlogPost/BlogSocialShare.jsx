import SocialLinkItem from "../Blogs/SocialLinkItem";

const BlogSocialShare = () => {
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-4 border-y border-neutral-200 py-6">
      <div>
        <span className="text-sm font-semibold text-neutral-700">
          Share This Post
        </span>
      </div>
      <div className="flex items-center gap-3">
        <SocialLinkItem url={url} platform="instagram">
          {/* Instagram SVG */}
        </SocialLinkItem>
        <SocialLinkItem url={url} platform="facebook">
          {/* Facebook SVG */}
        </SocialLinkItem>
        <SocialLinkItem url={url} platform="twitter">
          {/* Twitter SVG */}
        </SocialLinkItem>
        <SocialLinkItem url={url} platform="linkedin">
          {/* LinkedIn SVG */}
        </SocialLinkItem>
      </div>
    </div>
  );
};

export default BlogSocialShare;