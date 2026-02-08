"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  add_comment,
  clearMessage,
  get_blogPost,
} from "../../store/reducers/blogPostReducer";

const CommentForm = ({ blogId }) => {
  const blogPostId = blogId;
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [comment, setComment] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    comment: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComment({
      ...comment,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error("You must sign in first");
      return;
    }

    const { name, email, comment: userComment } = comment;
    if (!name || !email || !userComment) {
      toast.error("You must fill all inputs");
      return;
    }

    try {
      await dispatch(add_comment({ comment, blogPostId })).unwrap();
      // Refresh the blog post to show the new comment
      await dispatch(get_blogPost(blogId)).unwrap();
      toast.success("Comment added successfully");

      setComment({ ...comment, comment: "" }); // Only clear the comment text, keep name/email
    } catch (error) {
      toast.error(error?.message || "Failed to add comment");
    } finally {
      dispatch(clearMessage());
    }
  };

  // If user is not logged in, show login prompt
  if (!userInfo) {
    return (
      <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-neutral-600">Please log in to leave a comment</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 text-xl font-semibold text-neutral-900">
        Leave a comment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-neutral-700"
          >
            Your Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            placeholder="Share your thoughts..."
            value={comment.comment}
            onChange={handleInputChange}
            rows="4"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            required
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-900 bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          >
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
