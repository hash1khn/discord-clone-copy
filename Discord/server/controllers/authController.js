import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


export const registerUser = async (req, res, next) => {
  try {
    let { username, email, password, handle, avatar } = req.body;

    username = username?.trim();
    email = email?.toLowerCase().trim();
    handle = handle?.trim().toLowerCase();

    if (!username || !email || !password || !handle) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!handle.startsWith("@")) {
      return res.status(400).json({ message: "Handle must start with @" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { handle }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or handle already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      handle, // Already validated to start with "@"
      avatar: avatar || "", // Default empty string if no avatar is provided
      friends: [], // Initialize empty friends array
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        handle: user.handle,
        avatar: user.avatar,
        friends: user.friends,
      },
      token: generateToken(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        handle: user.handle,
        avatar: user.avatar,
        friends: user.friends,
      },
      token: generateToken(user),
    });
  } catch (error) {
    next(error);
  }
};
