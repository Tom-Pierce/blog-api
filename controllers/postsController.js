const { body, validationResult } = require("express-validator");
const Post = require("../models/post");

// Get posts
exports.posts_get = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublished: true }, "-isPublished")
      .sort({ datePublished: -1 })
      .populate("author", "username")
      .exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(200).json("No posts found");
  }
};

// Create Post
exports.posts_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must have a title")
    .escape(),

  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Your post must have a text")
    .escape(),

  body("published").trim().isBoolean().escape(),

  async (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Must be admin to create a post" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const post = new Post({
        title: req.body.title,
        author: req.user._id,
        text: req.body.text,
        isPublished: req.body.published,
      });
      post.save();
      return res.status(201).json({ message: "Post created" });
    } catch (error) {
      return next(error);
    }
  },
];

// Get specific post
exports.post_get = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .exec();
    if (post.isPublished) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    return next(error);
  }
};
