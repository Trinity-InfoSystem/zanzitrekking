import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_footer_blogs = createAsyncThunk(
  "blogPost/get_footer_blogs",
  async (
    {
      perPage = 2,
      currentPage = 1,
      searchValue = "",
      sortBy = "newest",
      startDate = "",
      endDate = "",
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/blogPosts-get?page=${currentPage}&searchValue=${searchValue}&parPage=${perPage}&sortBy=${sortBy}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_blogPosts = createAsyncThunk(
  "blogPost/get_blogPosts",
  async (
    {
      perPage = 6,
      currentPage = 1,
      searchValue = "",
      sortBy = "newest",
      startDate = "",
      endDate = "",
      category = "",
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/blogPosts-get?page=${currentPage}&searchValue=${searchValue}&parPage=${perPage}&sortBy=${sortBy}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}${
          category ? `&category=${category}` : ""
        }`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_latest_blogs = createAsyncThunk(
  "blogPost/get_latest_blogs",
  async (
    {
      perPage = 3,
      currentPage = 1,
    },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/blogPosts-get?page=${currentPage}&parPage=${perPage}&sortBy=newest`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_blog_categories = createAsyncThunk(
  "blogPost/get_blog_categories",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/blog-categories", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_blogPost = createAsyncThunk(
  "blogPost/get_blogPost",
  async (blogPostId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/blogPost-get/${blogPostId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const add_comment = createAsyncThunk(
  "blogPost/add_comment",
  async ({ comment, blogPostId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/add-comment-blogPost/${blogPostId}`,
        comment,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const update_comment = createAsyncThunk(
  "blogPost/update_comment",
  async (
    { commentId, updatedComment, blogPostId },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      // Ensure commentId is always included in the request body
      const requestBody = {
        commentId: commentId || null, // Explicitly set to null if undefined to ensure it's included
        ...updatedComment,
      };
      
      // Override with commentId if it was provided (in case updatedComment also has commentId)
      if (commentId) {
        requestBody.commentId = commentId;
      }
      
      console.log("Update comment - commentId:", commentId);
      console.log("Update comment - requestBody:", requestBody);
      
      const { data } = await api.put(
        `/add-comment-blogPost/${blogPostId}`,
        requestBody,
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const delete_comment = createAsyncThunk(
  "blogPost/delete_comment",
  async (
    { commentId, blogPostId, email },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.delete(`/add-comment-blogPost/${blogPostId}`, {
        data: { commentId, email },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);


export const blogPostReducer = createSlice({
  name: "blogPost",
  initialState: {
    successMessage: "",
    errorMessage: "",
    footerBlogsLoader: false,
    loader: false,
    blogPosts: [],
    footerBlogs: [],
    latestBlogs: [],
    latestBlogsLoader: false,
    blogCategories: [],
    totalblogPosts: 0,
    blogPost: {},
  },
  reducers: {
    clearMessage: (state) => {
      return {
        ...state,
        errorMessage: "",
        successMessage: "",
      };
    },
    clearBlogPost: (state) => {
      return {
        ...state,
        blogPost: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_blogPosts.fulfilled, (state, { payload }) => {
      state.blogPosts = payload.blogPosts;
      state.successMessage = payload.message;
      state.totalblogPosts = payload.totalblogPosts;
      state.loader = false;
    });
    builder.addCase(get_blogPosts.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_blogPosts.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_footer_blogs.fulfilled, (state, { payload }) => {
      state.footerBlogs = payload.blogPosts;
      state.successMessage = payload.message;
      state.footerBlogsLoader = false;
    });
    builder.addCase(get_footer_blogs.pending, (state, { payload }) => {
      state.footerBlogsLoader = true;
    });
    builder.addCase(get_footer_blogs.rejected, (state, { payload }) => {
      state.footerBlogsLoader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_blogPost.fulfilled, (state, { payload }) => {
      state.blogPost = payload.blogPost;

      state.loader = false;
    });
    builder.addCase(get_blogPost.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(get_blogPost.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(add_comment.fulfilled, (state, { payload }) => {
      state.blogPost = payload.blogPost;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(add_comment.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(add_comment.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    builder.addCase(update_comment.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(update_comment.fulfilled, (state, { payload }) => {
      state.blogPost = payload.updatedBlogPost;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(update_comment.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });

    // Delete Comment Cases
    builder.addCase(delete_comment.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(delete_comment.fulfilled, (state, { payload }) => {
      state.blogPost = payload.updatedBlogPost;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_comment.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_latest_blogs.fulfilled, (state, { payload }) => {
      state.latestBlogs = payload.blogPosts || [];
      state.latestBlogsLoader = false;
    });
    builder.addCase(get_latest_blogs.pending, (state) => {
      state.latestBlogsLoader = true;
    });
    builder.addCase(get_latest_blogs.rejected, (state, { payload }) => {
      state.latestBlogsLoader = false;
      state.errorMessage = payload?.errorMessage || "Failed to load latest blogs";
    });
    builder.addCase(get_blog_categories.fulfilled, (state, { payload }) => {
      state.blogCategories = payload.categories || [];
    });
    builder.addCase(get_blog_categories.rejected, (state, { payload }) => {
      state.errorMessage = payload?.errorMessage || "Failed to load blog categories";
    });
  },
});
export const { clearMessage, clearBlogPost } = blogPostReducer.actions;
export default blogPostReducer.reducer;
