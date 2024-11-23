import Post from "../models/postModel.js"; // Import your Post model
import { body, validationResult } from "express-validator"; // Import validation libraries

// Validation middleware for creating/updating posts
const validatePost = [
  body("title").notEmpty().withMessage("Title is required."),
  body("content").notEmpty().withMessage("Content is required."),
  body("author").optional().notEmpty().withMessage("Author is required."),
];

// Create a new post
export const createPost = [
  ...validatePost,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation Errors:", errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, author } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    console.log("Creating post with data:", {
      title,
      content,
      author,
      imageUrl,
    });

    const newPost = new Post({
      title,
      content,
      author,
      imageUrl,
    });

    try {
      const savedPost = await newPost.save();
      console.log("Post saved successfully:", savedPost);
      return res.status(201).json({ success: true, data: savedPost });
    } catch (error) {
      console.error("Error saving post:", error.message);
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
];

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    console.log("Retrieved all posts:", posts.length); // Log number of posts retrieved
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error retrieving posts:", error.message); // Log error message
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  console.log("Fetching post by ID:", req.params.id); // Log the ID being fetched
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.warn("Post not found for ID:", req.params.id); // Log if post is not found
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("Error fetching post:", error.message); // Log error message
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a post by ID
export const updatePost = [
  ...validatePost,
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation Errors on update:", errors.array()); // Log validation errors
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, author } = req.body;
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl;

    console.log("Updating post ID:", req.params.id, "with data:", {
      title,
      content,
      author,
      imageUrl,
    }); // Log update data

    try {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { title, content, author, imageUrl },
        { new: true, runValidators: true }
      );
      if (!updatedPost) {
        console.warn("Post not found for update ID:", req.params.id); // Log if post is not found for update
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      console.log("Post updated successfully:", updatedPost); // Log updated post
      return res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
      console.error("Error updating post:", error.message); // Log error message
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
];

// Delete a post by ID
export const deletePost = async (req, res) => {
  console.log("Deleting post by ID:", req.params.id); // Log the ID being deleted
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      console.warn("Post not found for deletion ID:", req.params.id); // Log if post is not found for deletion
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    console.log("Post deleted successfully:", deletedPost); // Log deleted post details
    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error.message); // Log error message
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
