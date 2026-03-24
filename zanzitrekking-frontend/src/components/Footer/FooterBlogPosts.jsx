import { resolveMediaUrl } from "../../utils/imageUtils";
import BlogPost from "./BlogPost";
import { BookOpen } from "lucide-react";

const FooterBlogPosts = ({ blogPosts }) => {
  const formatCustomDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleString("en-US", options);
  };

  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const latestTwo = sortedPosts.slice(0, 2);

  return (
    <div className="lg:col-span-1">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200">
          <BookOpen className="h-4.5 w-4.5 text-secondary-600" />
        </div>
        <h3 className="text-base font-semibold text-text-dark">
          Latest Stories
        </h3>
      </div>

      <div className="space-y-4">
        {latestTwo.length > 0 ? (
          latestTwo.map((post) => {
            const imageName = post.mainImage
              ? resolveMediaUrl(post.mainImage)
              : "/placeholder.svg";
            return (
              <BlogPost
                key={post._id}
                id={post._id}
                image={imageName}
                title={post.mainTitle}
                date={formatCustomDate(post.createdAt)}
              />
            );
          })
        ) : (
          <div className="rounded-xl bg-neutral-50 p-6 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500">
              No stories yet. Stay tuned!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterBlogPosts;
