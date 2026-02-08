import { refectorImage } from "../../utils/imageUtils";
import BlogImage from "./BlogImage";
import BlogQuote from "./BlogQuote";
import BlogRelatedImages from "./BlogRelatedImages";
import BlogWriter from "../Blogs/BlogWriter";
import "../../styles/blog-content.css";
import { sanitizeHTML } from "../../utils/sanitize";

const BlogContent = ({ blogPost }) => {
  // Check if content type is HTML
  const isHtmlContent = blogPost?.contentType === "html";

  return (
    <div className="space-y-12">
      {/* Main content card */}
      <div
        className="rounded-xl border border-neutral-200 bg-white p-8 shadow-soft md:p-12"
        data-aos="fade-up"
      >
        {isHtmlContent ? (
          /* HTML Content */
          <div
            className="prose prose-lg prose-primary max-w-none"
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(blogPost?.htmlContent),
            }}
          />
        ) : (
          /* Structured Content */
          <>
            {/* First paragraph - appears before image on mobile */}
            <p className="mb-6 text-lg leading-relaxed text-neutral-700 md:hidden">
              {blogPost?.mainParagraph}
            </p>

            {/* Image with text wrapping on desktop */}
            <div className="relative my-8 md:my-10">
              {/* Mobile layout - full width image after first paragraph */}
              <div className="md:hidden">
                <BlogImage
                  image={refectorImage(blogPost?.mainImage)}
                  alt="Main blog image"
                  className="w-full rounded-xl shadow-soft"
                />
              </div>
              {/* Desktop layout - floated image with text wrapping */}
              <div className="hidden md:block">
                <div className="float-right mb-6 ml-8 flex w-1/2 justify-center">
                  <BlogImage
                    image={refectorImage(blogPost?.mainImage)}
                    alt="Main blog image"
                    className="h-auto w-full max-w-lg rounded-xl shadow-soft"
                  />
                </div>
                <p className="text-lg leading-relaxed text-neutral-700">
                  {blogPost?.mainParagraph}
                </p>
              </div>
            </div>

            {/* Remaining content */}
            <p className="clear-right mb-6 text-lg leading-relaxed text-neutral-700 md:clear-none">
              {blogPost?.secondParagraph}
            </p>
            <p className="mb-8 text-lg leading-relaxed text-neutral-700">
              {blogPost?.thirdParagraph}
            </p>

            {/* Section heading */}
            {blogPost?.secondTitle && (
              <div className="mb-6" data-aos="fade-up" data-aos-delay="100">
                <h3 className="mb-3 text-2xl font-bold text-neutral-900">
                  {blogPost?.secondTitle}
                </h3>
                <div className="h-px w-16 bg-neutral-300"></div>
              </div>
            )}

            <p className="mb-8 text-lg leading-relaxed text-neutral-700">
              {blogPost?.fourthParagraph}
            </p>

            {/* Quote section */}
            {blogPost?.proverb && (
              <div className="my-8" data-aos="fade-up" data-aos-delay="200">
                <BlogQuote
                  quote={blogPost?.proverb}
                  author={blogPost?.proverbWriter}
                />
              </div>
            )}

            {/* Related images section */}
            {blogPost?.relatedImages?.image1 && (
              <div className="my-8" data-aos="fade-up" data-aos-delay="300">
                <BlogRelatedImages
                  title={blogPost?.relatedImages?.title}
                  image1={refectorImage(blogPost?.relatedImages?.image1)}
                  image2={refectorImage(blogPost?.relatedImages?.image2)}
                  paragraph={blogPost?.relatedImages?.paragraph}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Author section */}
      <div className="mt-12 border-t border-neutral-200 pt-12" data-aos="fade-up" data-aos-delay="500">
        <BlogWriter
          authorImg={refectorImage(blogPost?.creatorImage)}
          authorName={blogPost?.creatorName}
          authorDetails={blogPost?.creatorBio}
          facebookLink={blogPost?.creatorSocialLinks?.facebook || "#"}
          twitterLink={blogPost?.creatorSocialLinks?.twitter || "#"}
          instagramLink={blogPost?.creatorSocialLinks?.instagram || "#"}
        />
      </div>
    </div>
  );
};

export default BlogContent;
