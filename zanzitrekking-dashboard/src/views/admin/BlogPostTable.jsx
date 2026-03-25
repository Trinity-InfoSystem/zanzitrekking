import { Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaTrash, FaCode, FaFileAlt, FaComments } from "react-icons/fa";
import { isViewer } from "../../utils/roleVerification";
import {
  get_blogPost_comments,
  delete_blogPost_comment,
} from "../../store/Reducers/blogPostReducer";
import toast from "react-hot-toast";
import { resolveMediaUrl } from "../../utils/constants";

const BlogPostTable = ({
  blogPosts,
  startIndex,
  deleteBlogPost,
  role,
}) => {
  const dispatch = useDispatch();
  const { comments = [], commentsLoading = false } = useSelector(
    (state) => state.blog || {},
  );
  const email = useSelector((state) => state.auth?.userInfo?.email);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleOpenComments = async (blogPost) => {
    setSelectedBlogPost(blogPost);
    setIsModalOpen(true);
    try {
      await dispatch(get_blogPost_comments(blogPost._id)).unwrap();
    } catch (error) {
      toast.error(error?.errorMessage || "Failed to load comments");
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Open confirmation modal
    setCommentToDeleteId(commentId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!selectedBlogPost?._id || !commentToDeleteId) return;

    setIsDeletingComment(true);
    try {
      await dispatch(
        delete_blogPost_comment({
          blogPostId: selectedBlogPost._id,
          commentId: commentToDeleteId,
          email,
        }),
      ).unwrap();
      // Refresh comments
      await dispatch(get_blogPost_comments(selectedBlogPost._id)).unwrap();
      setIsDeleteConfirmOpen(false);
      setCommentToDeleteId(null);
    } catch (error) {
      toast.error(error?.errorMessage || "Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl ring-1 ring-primary-100">
        <table className="w-full min-w-[700px] table-auto">
          <thead className="bg-gradient-to-r from-primary-50 to-secondary-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                Preview
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                Creator
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                Type
              </th>
              {!isViewer(role) && (
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100 bg-white">
            {blogPosts.map((blogPost, i) => {
              let imageName = blogPost?.mainImage
                ? resolveMediaUrl(blogPost.mainImage)
                : "/placeholder.svg";
              return (
                <tr
                  key={blogPost._id}
                  className="group transition-colors hover:bg-primary-50/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-text-dark">
                    <span className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-sunshine-400 font-bold text-white">
                      {startIndex + i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative overflow-hidden rounded-lg ring-2 ring-primary-200 transition-all group-hover:ring-secondary">
                      <img
                        src={imageName}
                        alt={blogPost.mainTitle}
                        className="h-16 w-16 object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="truncate text-sm font-semibold text-primary-800">
                        {blogPost.mainTitle}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="shadow-coral-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-sunshine-400 text-xs font-bold text-white">
                        {blogPost.creatorName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-text-dark">
                        {blogPost.creatorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {blogPost.contentType === "html" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-info-100 px-3 py-1 text-xs font-semibold text-info-700">
                        <FaCode className="text-xs" />
                        HTML
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
                        <FaFileAlt className="text-xs" />
                        Structured
                      </span>
                    )}
                  </td>
                  {!isViewer(role) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenComments(blogPost)}
                          className="group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-primary-400 to-primary-500 p-3 text-white shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-medium"
                          title="View Comments"
                        >
                          <FaComments className="transition-transform group-hover/btn:scale-110" />
                        </button>
                        <Link
                          to={`/admin/dashboard/edit-blogPost/${blogPost._id}`}
                          className="group/btn shadow-sunshine-soft hover:shadow-sunshine-medium relative overflow-hidden rounded-lg bg-gradient-to-r from-sunshine-400 to-sunshine-500 p-3 text-white transition-all duration-300 hover:scale-110"
                        >
                          <FaEdit className="transition-transform group-hover/btn:scale-110" />
                        </Link>
                        <button
                          onClick={() => deleteBlogPost(blogPost._id)}
                          className="group/btn relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent-600 p-3 text-white shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-medium"
                        >
                          <FaTrash className="transition-transform group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comments Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-primary-900">
                  Comments - {selectedBlogPost?.mainTitle}
                </h2>
                <p className="text-sm text-neutral-600">
                  {comments?.length || 0} comment
                  {comments?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <svg
                  className="h-6 w-6"
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

            {/* Modal Body */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                </div>
              ) : comments?.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-1.5 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">
                              {comment.customerName?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                {comment.customerName || "Unknown User"}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatDate(comment.commentDate)}
                              </p>
                            </div>
                          </div>
                          <p className="ml-[2.625rem] text-sm text-neutral-700">
                            {comment.commentText}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={isDeletingComment}
                          className="ml-4 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete Comment"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FaComments className="mb-4 h-12 w-12 text-neutral-300" />
                  <p className="text-lg font-medium text-neutral-600">
                    No comments yet
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    This blog post doesn't have any comments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-lg font-bold text-neutral-900">
                Delete comment?
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                This action can’t be undone.
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (isDeletingComment) return;
                    setIsDeleteConfirmOpen(false);
                    setCommentToDeleteId(null);
                  }}
                  disabled={isDeletingComment}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteComment}
                  disabled={isDeletingComment}
                  className="rounded-lg bg-gradient-to-r from-accent to-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingComment ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogPostTable;
