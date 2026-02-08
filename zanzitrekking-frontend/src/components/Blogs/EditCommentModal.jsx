"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  clearMessage,
  update_comment,
} from "../../store/reducers/blogPostReducer";

const EditCommentModal = ({
  isOpen,
  onClose,
  commentId,
  blogPostId,
  initialComment,
}) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState(initialComment);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(
        update_comment({
          commentId,
          blogPostId,
          updatedComment: { comment: commentText, email: userInfo.email },
        }),
      ).unwrap();
      toast.success("Comment updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update comment");
    } finally {
      setIsUpdating(false);

      dispatch(clearMessage());
    }
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Edit Comment
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder-neutral-500 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-0"
              rows="5"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommentModal;
