import Post from "../models/Post.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

const populatePost = (query) =>
  query
    .populate("author", "name headline profilePicture")
    .populate("comments.user", "name profilePicture");

export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error("Post content is required");
    }

    const postData = { author: req.user._id, content };

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "devconnect/posts",
        req.file.mimetype
      );
      postData.image = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    }

    const post = await Post.create(postData);
    const populated = await populatePost(Post.findById(post._id));

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 25);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      populatePost(Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)),
      Post.countDocuments()
    ]);

    res.json({
      posts,
      page,
      hasMore: skip + posts.length < total
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!post.author.equals(req.user._id)) {
      res.status(403);
      throw new Error("You can only edit your own posts");
    }

    post.content = req.body.content ?? post.content;
    const saved = await post.save();
    const populated = await populatePost(Post.findById(saved._id));

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!post.author.equals(req.user._id)) {
      res.status(403);
      throw new Error("You can only delete your own posts");
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const liked = post.likes.some((id) => id.equals(req.user._id));
    liked ? post.likes.pull(req.user._id) : post.likes.addToSet(req.user._id);
    await post.save();

    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const bookmarked = post.bookmarks.some((id) => id.equals(req.user._id));
    bookmarked ? post.bookmarks.pull(req.user._id) : post.bookmarks.addToSet(req.user._id);
    await post.save();

    res.json({ bookmarked: !bookmarked, bookmarksCount: post.bookmarks.length });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!req.body.text) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};
