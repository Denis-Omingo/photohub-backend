import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import mongoose from "mongoose";

const SECRET_KEY = process.env.JWT_SECRET || "secret=hhgcfddf-key";

/**
 * Extracts and verifies JWT from Authorization header
 * @param req - Express request object
 * @returns Decoded JWT payload containing userId or null
 */
const getUserIdFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    return decoded?.userId || null;
  } catch (error) {
    console.error("Invalid Token:", error);
    return null;
  }
};

//Get current loggedin user
const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(currentUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Creates a new user or retrieves an existing one
 */
const createCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: "Missing required field: Email is mandatory." });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Generate a unique username from the email
      let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, ""); // Remove special characters
      let username = baseUsername;
      let isUnique = false;
      let attempt = 1;

      while (!isUnique) {
        const existingUser = await User.findOne({ userName: username });
        if (!existingUser) {
          isUnique = true;
        } else {
          username = `${baseUsername}${Math.floor(Math.random() * 1000)}`; // Append random number
        }
        attempt++;
        if (attempt > 5) break; // Avoid infinite loops
      }

      // Create new user with MongoDB's auto-generated _id
      user = new User({ email, name, userName: username });

      // Save new user
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "7d" });

    res.status(201).json({ 
      message: "User authenticated successfully", 
      user: {
        _id: user._id, // Ensure _id is returned
        email: user.email,
        name: user.name,
        userName: user.userName
      }, 
      token 
    });

  } catch (error: any) {
    console.error("Error signing in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates the current user's profile
 */
const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    console.log(userId)
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const { name, userName, addressLine1, country, city } = req.body;
    if (!name || !userName || !addressLine1 || !country || !city) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Check if the userName is already taken (excluding the current user)
    const existingUser = await User.findOne({ userName, _id: { $ne: userId } });
    if (existingUser) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, userName, addressLine1, country, city },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};


/**
 * Get all users from the database
 */
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logs out the user by clearing authentication cookies
 */
const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export default { getCurrentUser,createCurrentUser, updateCurrentUser, logoutUser, getAllUsers };
