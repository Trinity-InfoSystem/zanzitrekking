const BlogImage = ({ image, alt, className = "" }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={image}
          alt={alt}
          className="w-full object-cover"
        />
      </div>
    </div>
  );
};

export default BlogImage;