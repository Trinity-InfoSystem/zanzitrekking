import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { get_latest_blogs } from "../../store/reducers/blogPostReducer";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { FaRegComment } from "react-icons/fa6";
import { IMAGES_URL } from "../../utils/constants";
import AOS from "aos";
import "aos/dist/aos.css";

const LatestBlogs = () => {
  const dispatch = useDispatch();
  const { latestBlogs, latestBlogsLoader } = useSelector((state) => state.blog);

  useEffect(() => {
    dispatch(get_latest_blogs({ perPage: 3 }));
  }, [dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (latestBlogsLoader) {
    return (
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600"></div>
            </div>
          </div>
        </div>
        {/* Section divider */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      </section>
    );
  }

  if (!latestBlogs || latestBlogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className="relative bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 py-16">
      <div className="px-4 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-12 text-center" data-aos="fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2">
              <BookOpen className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Latest Stories
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-primary-900 lg:text-5xl">
              Read Our Latest Blogs
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-text-light">
              Discover travel tips, safari guides, and inspiring stories from
              the heart of Tanzania
            </p>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestBlogs.map((post, index) => {
              const imageName = post.mainImage
                ? IMAGES_URL + post.mainImage.split("/").pop()
                : "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=600";
              
              return (
                <Link
                  key={post._id}
                  to={`/blog/${post._id}`}
                  className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft transition-all hover:border-primary-200 hover:shadow-soft-md"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      src={imageName}
                      alt={post.mainTitle}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute left-3 top-3 rounded-lg bg-primary-600/95 px-3 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur-sm">
                        {post.category}
                      </div>
                    )}

                    {/* Comments Badge */}
                    {post.commentsCount > 0 && (
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary-800 shadow-soft backdrop-blur-sm">
                        <FaRegComment className="h-3.5 w-3.5" />
                        <span>{post.commentsCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-text-light">
                      <Calendar className="h-3.5 w-3.5" />
                      <time>{formatDate(post.creationDate || post.createdAt)}</time>
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 text-lg font-bold leading-tight text-primary-800 transition-colors group-hover:text-primary-600 line-clamp-2">
                      {post.mainTitle}
                    </h3>

                    {/* Paragraph - Truncated */}
                    {post.mainParagraph && (
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-light">
                        {post.mainParagraph}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 transition-all group-hover:gap-3">
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center" data-aos="fade-up">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3 text-base font-semibold text-white shadow-soft transition-all hover:from-primary-700 hover:to-primary-800 hover:shadow-soft-md"
            >
              <span>View All Blogs</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      {/* Section divider */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
    </section>
  );
};

export default LatestBlogs;
