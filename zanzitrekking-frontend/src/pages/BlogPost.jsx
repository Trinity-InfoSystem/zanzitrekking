import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get_blogPost } from "../store/reducers/blogPostReducer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BlogContent from "../components/BlogPost/BlogContent";
import BlogComments from "../components/BlogPost/BlogComments";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { IMAGES_URL } from "../utils/constants";
import AOS from "aos";
import "aos/dist/aos.css";
import GoogleReviewsWidget from "../components/GoogleReviewsWidget";
import TripadvisorReviews from "../components/TripadvisorReviews";

const BlogPost = () => {
  const dispatch = useDispatch();
  const { blogId } = useParams();
  const { blogPost } = useSelector((state) => state.blog);

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 600,
      offset: 60,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    dispatch(get_blogPost(blogId));
  }, [blogId, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) {return "Today";}
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const blogImage = blogPost?.mainImage
    ? IMAGES_URL + blogPost.mainImage.split("/").pop()
    : "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Enhanced Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={blogImage}
            alt={blogPost?.mainTitle || "Blog Post"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-primary-800/40 to-primary-900/50" />

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-accent-400 blur-3xl" />
            <div className="absolute right-20 top-40 h-40 w-40 rounded-full bg-secondary-400 blur-3xl" />
            <div className="absolute bottom-20 left-1/3 h-36 w-36 rounded-full bg-primary-400 blur-3xl" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-20 md:px-12 lg:py-32">
          <div className="mx-auto max-w-4xl">
            {/* Back button */}
            <div className="mb-8" data-aos="fade-right">
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Blog
              </Link>
            </div>

            {/* Blog meta info */}
            <div className="text-center" data-aos="fade-up">
              {/* Badge */}
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm"
                data-aos="fade-up"
              >
                <BookOpen className="h-4 w-4 text-accent-300" />
                <span className="text-sm font-semibold text-white">
                  Travel Article
                </span>
              </div>

              {/* Title */}
              <h1
                className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {blogPost?.mainTitle}
              </h1>

              {/* Date */}
              <div
                className="flex items-center justify-center gap-2 text-sm text-white/80"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Calendar className="h-4 w-4" />
                <time>{formatDate(blogPost?.creationDate)}</time>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-16">
        <div className="px-4 md:px-12">
          <div className="mx-auto max-w-4xl">
            <BlogContent blogPost={blogPost} />
            <div className="mt-16">
              <BlogComments blogPost={blogPost} blogId={blogId} />
            </div>
          </div>
        </div>
        <TripadvisorReviews />
        <GoogleReviewsWidget />
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;
