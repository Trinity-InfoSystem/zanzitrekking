import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const SocialLinkItem = ({ url, platform, children }) => {
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
    );
  };
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied! You can now share it on Instagram.");
  };
  const shareOnTwitter = () => {
    if (url && url.startsWith("http")) {
      const title = "the blogs tittle";
      const text = encodeURIComponent(
        `Check out this amazing blog post: ${title}`,
      );
      const encodedUrl = encodeURIComponent(url);
      window.open(
        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
        "_blank",
      );
    } else {
      alert("Invalid URL. Make sure the URL starts with 'http' or 'https'.");
    }
  };
  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };
  const handleShare = () => {
    switch (platform) {
      case "facebook":
        shareOnFacebook();
        break;
      case "instagram":
        copyLinkToClipboard();
        break;
      case "twitter":
        shareOnTwitter();
        break;
      case "linkedin":
        shareOnLinkedIn();
        break;
      default:
        break;
    }
  };
  return <Link onClick={handleShare}>{children}</Link>;
};

export default SocialLinkItem;
