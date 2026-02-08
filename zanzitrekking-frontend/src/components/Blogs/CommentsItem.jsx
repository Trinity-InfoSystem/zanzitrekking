"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { delete_comment } from "../../store/reducers/blogPostReducer";
import toast from "react-hot-toast";
import EditCommentModal from "./EditCommentModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const CommentsItem = ({
  commentId,
  authorName,
  authorImg,
  commentDate,
  comments,
  blogPostId,
  customerId,
  currentUserId,
}) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await dispatch(
        delete_comment({
          commentId,
          blogPostId,
          email: userInfo.email, // Send the email from userInfo
        }),
      ).unwrap();
      toast.success("Comment deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700">
              {authorName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">
                {authorName}
              </h4>
              <p className="text-xs text-neutral-500">{commentDate}</p>
            </div>
          </div>
          <p className="ml-[3.25rem] text-sm leading-relaxed text-neutral-700">
            {comments}
          </p>
        </div>

        {currentUserId === customerId && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Edit comment"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Delete comment"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <EditCommentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        commentId={commentId}
        blogPostId={blogPostId}
        initialComment={comments}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CommentsItem;
