"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import { FaImage } from "react-icons/fa";
import {
  clearMessage,
  delete_blogPost,
  get_blogPosts,
} from "../../store/Reducers/blogPostReducer";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import { overrideStyle } from "../../utils/utilis";
import HeaderText from "./HeaderText";
import BlogPostSearchBar from "./BlogPostSearchBar";
import BlogPostTable from "./BlogPostTable";
import SortSelect from "../components/SortSelect";

const BlogPosts = () => {
  const dispatch = useDispatch();
  const [parPage, setparPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState("newest-desc");

  const { blogPosts, errorMessage, loader, successMessage, totalblogPosts } =
    useSelector((state) => state.blog);
  const role = useSelector((state) => state.auth?.userInfo?.role);

  const deleteBlogPost = (blogPostId) => {
    dispatch(delete_blogPost(blogPostId));
  };

  useEffect(() => {
    dispatch(get_blogPosts({ parPage, currentPage, searchValue, sort }));
  }, [dispatch, parPage, currentPage, searchValue, sort]);

  const startIndex = (currentPage - 1) * parPage;

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_blogPosts({ parPage, currentPage, searchValue }));
      dispatch(clearMessage());
    }
  }, [
    dispatch,
    errorMessage,
    successMessage,
    parPage,
    currentPage,
    searchValue,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="mx-auto max-w-7xl">
        <HeaderText title="Blog Posts " />
        {/* Main Content Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
          {/* Search Section */}
          <div className="border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <BlogPostSearchBar
                setParPage={setparPage}
                setSearchValue={setSearchValue}
                searchValue={searchValue}
              />
              <SortSelect sort={sort} setSort={setSort} />
            </div>
          </div>
          {/* Content Section */}
          <div className="p-6">
            {loader ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <PropagateLoader cssOverride={overrideStyle} color="#E76F51" />
                <p className="text-primary-800">Loading blog posts...</p>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <div className="shadow-coral-soft flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-sunshine-400">
                  <FaImage className="text-2xl text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary-800">
                    No blog posts found
                  </h3>
                  <p className="text-text-light">
                    Get started by creating your first blog post
                  </p>
                </div>
              </div>
            ) : (
              <BlogPostTable
                blogPosts={blogPosts}
                startIndex={startIndex}
                deleteBlogPost={deleteBlogPost}
                role={role}
              />
            )}
          </div>
          {/* Pagination Section */}
          {!loader && blogPosts.length > 0 && (
            <div className="border-t border-primary-200 bg-neutral-50 px-6 py-4">
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-sm text-text-dark">
                  Showing{" "}
                  <span className="font-semibold text-secondary">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-secondary">
                    {Math.min(startIndex + parPage, totalblogPosts)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-secondary">
                    {totalblogPosts}
                  </span>{" "}
                  results
                </p>
                <Pagination
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  totalItem={totalblogPosts}
                  parPage={parPage}
                  showItem={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPosts;
