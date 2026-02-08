"use client";

import { MessageCircle } from "lucide-react";
import CommentsItem from "./CommentsItem";
import { useSelector } from "react-redux";

function formatCustomDate(isoDate) {
  const date = new Date(isoDate);
  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date
    .toLocaleString("en-US", options)
    .replace(",", "")
    .replace(" at", " at");
}

const Comments = ({ blogPost }) => {
  const commentCount = blogPost?.comments?.length || 0;
  const { userInfo } = useSelector((state) => state.auth);
  const currentUserId = userInfo?.id;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-3 border-b border-neutral-200 pb-4">
        <MessageCircle className="h-5 w-5 text-neutral-600" />
        <h3 className="text-xl font-bold text-neutral-900">
          {commentCount === 1 ? "1 Comment" : `${commentCount} Comments`}
        </h3>
      </div>

      {commentCount > 0 ? (
        <div className="space-y-4">
          {blogPost?.comments?.map((comment) => (
            <CommentsItem
              key={comment?._id}
              commentId={comment?._id}
              authorImg={comment?.customerName}
              authorName={comment?.customerName}
              commentDate={formatCustomDate(comment?.commentDate)}
              comments={comment?.commentText}
              blogPostId={blogPost?._id}
              customerId={comment?.customerId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 py-12 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-neutral-400" />
          <p className="text-base font-medium text-neutral-700">
            No comments yet
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Be the first to share your thoughts
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;
