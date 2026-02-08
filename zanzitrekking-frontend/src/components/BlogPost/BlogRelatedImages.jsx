import BlogImage from "./BlogImage";

const BlogRelatedImages = ({ title, image1, image2, paragraph }) => {
  const isImage1Valid = image1 && !image1.includes("/placeholder.svg");
  const isImage2Valid = image2 && !image2.includes("/placeholder.svg");

  // If both images are placeholders, don't render the component
  if (!isImage1Valid && !isImage2Valid) {return null;}

  return (
    <div>
      {title && (
        <h3 className="mb-6 text-2xl font-bold text-neutral-900">
          {title}
        </h3>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {isImage1Valid && (
          <div>
            <BlogImage image={image1} alt="Related image 1" className="mb-0" />
          </div>
        )}
        {isImage2Valid && (
          <div>
            <BlogImage image={image2} alt="Related image 2" className="mb-0" />
          </div>
        )}
      </div>
      {paragraph && (
        <p className="mt-6 text-lg leading-relaxed text-neutral-700">
          {paragraph}
        </p>
      )}
    </div>
  );
};

export default BlogRelatedImages;
