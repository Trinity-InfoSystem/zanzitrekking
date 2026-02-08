import { ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const ContactItem = ({ icon, text, href, label }) => {
  const isEmail = href?.startsWith("mailto:");
  const emailAddress = isEmail ? href.replace("mailto:", "") : null;

  const handleClick = (e) => {
    if (isEmail && emailAddress) {
      e.preventDefault();
      navigator.clipboard.writeText(emailAddress).then(() => {
        toast.success(`Email copied: ${emailAddress}`);
      }).catch(() => {
        toast.error("Failed to copy email");
      });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target={href.startsWith("http") ? "_blank" : "_self"}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 transition-all duration-300 hover:border-primary-300 hover:shadow-md cursor-pointer"
      title={isEmail ? "Click to copy email" : label}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all duration-300 group-hover:bg-primary-100 group-hover:text-primary-600">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-dark">{text}</p>
          <p className="text-xs text-text-lighter">{label}</p>
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-neutral-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600 group-hover:opacity-100" />
    </a>
  );
};

export default ContactItem;
