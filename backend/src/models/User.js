import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const portfolioLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    url: { type: String, trim: true, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    headline: { type: String, trim: true, default: "Developer" },
    skills: [{ type: String, trim: true }],
    experience: { type: String, trim: true, default: "" },
    portfolioLinks: [portfolioLinkSchema],
    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
