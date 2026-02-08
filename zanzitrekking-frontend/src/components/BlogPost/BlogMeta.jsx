import { Calendar } from "lucide-react";
import { refectorImage } from "../../utils/imageUtils";
import BlogAuthor from "./BlogAuthor";

const BlogMeta = ({ blogPost }) => {
  const formatDate = (dateString) => {
    if (!dateString) {return "";}
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mb-12 rounded-xl border border-neutral-200 bg-white p-6 shadow-soft" data-aos="fade-up">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <BlogAuthor
          image={refectorImage(blogPost?.creatorImage)}
          name={blogPost?.creatorName}
        />

        {blogPost?.creationDate && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700">
            <Calendar className="h-4 w-4" />
            {formatDate(blogPost?.creationDate)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogMeta;
