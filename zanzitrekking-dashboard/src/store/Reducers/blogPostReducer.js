import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
export const blogPostAdd = createAsyncThunk(
  "blogPost/blogPostAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/blogPost-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_blogPosts = createAsyncThunk(
  "blogPost/get_blogPosts",
  async (
    { parPage = 10, currentPage = 1, searchValue = "", sort = "newest-desc" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/blogPosts-get?page=${currentPage}&&searchValue=${searchValue}&&parPage=${parPage}&&sort=${sort}`,
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
export const update_blogPost = createAsyncThunk(
  "blogPost/update_blogPost",
  async ({ blogPostId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/blogPost-update/${blogPostId}`,
        formData,
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
export const update_blogPost_category = createAsyncThunk(
  "blogPost/update_blogPost_category",
  async ({ blogPostId, category }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/blogPost-update-category/${blogPostId}`,
        { category },
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
export const delete_blogPost = createAsyncThunk(
  "blogPost/delete_blogPost",
  async (blogPostId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/blogPost-delete/${blogPostId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const get_blogPost_comments = createAsyncThunk(
  "blogPost/get_blogPost_comments",
  async (blogPostId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/blogPost-comments/${blogPostId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);
export const delete_blogPost_comment = createAsyncThunk(
  "blogPost/delete_blogPost_comment",
  async ({ blogPostId, commentId, email }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/add-comment-blogPost/${blogPostId}`,
        {
          data: { commentId, email },
          withCredentials: true,
        },
      );

      return fulfillWithValue({ ...data, deletedCommentId: commentId });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
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
export const blogPostReducer = createSlice({
  name: "blogPost",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    blogPosts: [],
    totalblogPosts: 0,
    blogPost: {},
    comments: [],
    commentsLoading: false,
    blogCategories: [],
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
    builder.addCase(blogPostAdd.fulfilled, (state, { payload }) => {
      state.blogPost = payload.blogPost;
      state.successMessage = payload.message;
      state.blogPosts = [...state.blogPosts, payload.blogPost];
      state.loader = false;
    });
    builder.addCase(blogPostAdd.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(blogPostAdd.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
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
    builder.addCase(update_blogPost.fulfilled, (state, { payload }) => {
      state.blogPost = payload.blogPost;
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(update_blogPost.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(update_blogPost.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_blogPost.fulfilled, (state, { payload }) => {
      state.successMessage = payload.message;
      state.loader = false;
    });
    builder.addCase(delete_blogPost.pending, (state, { payload }) => {
      state.loader = true;
    });
    builder.addCase(delete_blogPost.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_blogPost_comments.pending, (state) => {
      state.commentsLoading = true;
    });
    builder.addCase(get_blogPost_comments.fulfilled, (state, { payload }) => {
      state.comments = payload.comments || [];
      state.commentsLoading = false;
    });
    builder.addCase(get_blogPost_comments.rejected, (state, { payload }) => {
      state.commentsLoading = false;
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(delete_blogPost_comment.fulfilled, (state, { payload }) => {
      state.comments = state.comments.filter(
        (comment) => comment._id !== payload.deletedCommentId,
      );
      state.successMessage = payload.message;
    });
    builder.addCase(delete_blogPost_comment.rejected, (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
    });
    builder.addCase(get_blog_categories.fulfilled, (state, { payload }) => {
      state.blogCategories = payload.categories || [];
    });
    builder.addCase(get_blog_categories.rejected, (state, { payload }) => {
      state.errorMessage = payload?.errorMessage || "Failed to load blog categories";
    });
    builder.addCase(update_blogPost_category.fulfilled, (state, { payload }) => {
      state.blogPost = payload.blogPost;
      state.successMessage = payload.message;
      // Update the category in the blogPosts list if it exists
      const index = state.blogPosts.findIndex(
        (post) => post._id === payload.blogPost._id
      );
      if (index !== -1) {
        state.blogPosts[index].category = payload.blogPost.category;
      }
    });
    builder.addCase(update_blogPost_category.pending, (state) => {
      state.loader = true;
    });
    builder.addCase(update_blogPost_category.rejected, (state, { payload }) => {
      state.loader = false;
      state.errorMessage = payload?.errorMessage || "Failed to update category";
    });
  },
});
export const { clearMessage, clearBlogPost } = blogPostReducer.actions;
export default blogPostReducer.reducer;
