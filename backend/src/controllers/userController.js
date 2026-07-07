import User from "../models/User.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

export const listDevelopers = async (req, res, next) => {
  try {
    const query = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { skills: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("Developer not found");
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, headline, skills, experience, portfolioLinks } = req.body;
    const user = await User.findById(req.user._id);
    const parsedPortfolioLinks =
      typeof portfolioLinks === "string" && portfolioLinks.trim().startsWith("[")
        ? JSON.parse(portfolioLinks)
        : portfolioLinks;

    user.name = name ?? user.name;
    user.headline = headline ?? user.headline;
    user.skills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills.split(",").map((skill) => skill.trim()).filter(Boolean)
        : user.skills;
    user.experience = experience ?? user.experience;
    user.portfolioLinks = Array.isArray(parsedPortfolioLinks)
      ? parsedPortfolioLinks
      : user.portfolioLinks;

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "devconnect/profiles",
        req.file.mimetype
      );
      user.profilePicture = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
      };
    }

    const saved = await user.save();
    res.json(saved);
  } catch (error) {
    next(error);
  }
};

export const toggleFollow = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      res.status(404);
      throw new Error("Developer not found");
    }

    if (targetUser._id.equals(currentUser._id)) {
      res.status(400);
      throw new Error("You cannot follow yourself");
    }

    const isFollowing = currentUser.following.some((id) => id.equals(targetUser._id));

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.addToSet(targetUser._id);
      targetUser.followers.addToSet(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      following: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    next(error);
  }
};
