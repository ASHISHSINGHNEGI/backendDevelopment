import mongoose, { Schema } from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * User schema
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} email - Email address of the user
 * @property {string} fullname - Full name of the user
 * @property {string} avatar - Cloudinary URL of the user's avatar
 * @property {string} coverImage - Cloudinary URL of the user's cover image
 * @property {ObjectId[]} watchHistory - Array of video IDs that the user has watched
 * @property {string} password - Hashed password of the user
 * @property {string} refreshToken - Refresh token for the user
 */
const userSchema = new Schema(
  {
    /**
     * Username of the user
     * @type {string}
     */
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    /**
     * Email address of the user
     * @type {string}
     */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /**
     * Full name of the user
     * @type {string}
     */
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /**
     * Cloudinary URL of the user's avatar
     * @type {string}
     */
    avatar: {
      type: String,
      required: true,
    },
    /**
     * Cloudinary URL of the user's cover image
     * @type {string}
     */
    coverImage: {
      type: String,
    },
    /**
     * Array of video IDs that the user has watched
     * @type {ObjectId[]}
     */
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    /**
     * Hashed password of the user
     * @type {string}
     */
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    /**
     * Refresh token for the user
     * @type {string}
     */
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

/**
 * Hashes the password before saving the user
 * @param {function} next - Next middleware function
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Checks if the password matches the hashed password
 * @param {string} password - Password to check
 * @returns {Promise<boolean>} If the password matches
 */
userSchema.method.ispasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Generates an access token for the user
 * @returns {Promise<string>} The access token
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
/**
 * Generates a refresh token for the user
 * @returns {Promise<string>} The refresh token
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("users", userSchema);

