const SocialIcon = ({ icon, label, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 transition-all duration-300 hover:scale-110 hover:bg-primary-600 hover:shadow-lg"
      aria-label={label}
    >
      <span className="relative z-10 text-neutral-600 transition-colors duration-300 group-hover:text-white">
        {icon}
      </span>
      <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </a>
  );
};

export default SocialIcon;
