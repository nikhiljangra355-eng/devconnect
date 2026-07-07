import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  headline: user.headline,
  skills: user.skills,
  experience: user.experience,
  portfolioLinks: user.portfolioLinks,
  profilePicture: user.profilePicture,
  followers: user.followers,
  following: user.following
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("Email is already registered");
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      token: createToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      token: createToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: userPayload(req.user) });
};
