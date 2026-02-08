import Comments from "../Blogs/Comments";
import CommentForm from "../Blogs/CommentForm";
import { MessageCircle } from "lucide-react";

const BlogComments = ({ blogPost, blogId }) => {
  return (
    <div className="mt-12 space-y-8">
      {/* Comments header */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-neutral-600" />
          <h2 className="text-2xl font-bold text-neutral-900">Comments</h2>
        </div>
      </div>

      {/* Comments section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-soft">
        <Comments blogPost={blogPost} />
      </div>

      {/* Comment form section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-soft">
        <CommentForm blogId={blogId} />
      </div>
    </div>
  );
};

export default BlogComments;
