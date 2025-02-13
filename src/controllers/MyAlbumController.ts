import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import MyAlbum from "../models/album";

const SECRET_KEY = process.env.JWT_SECRET || "secret=hhgcfddf-key";

/**
 * Extracts and verifies JWT from Authorization header
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

/**
CREATE AN album for the logged-in user
 */
export const createMyAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user ID from token
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      return;
    }

    console.log("Logged User ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    // Extract album title from request body
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ message: "Album title is required" });
      return;
    }

    // Verify that the user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Create and save album
    const newAlbum = new MyAlbum({
      title,
      user: userId, // Associate album with logged-in user
      images: [],
    });

    await newAlbum.save();

    // Link album to user
    user.albums.push(newAlbum._id as mongoose.Types.ObjectId);
    await user.save();

    console.log("New album:", newAlbum);

    //  Ensure response includes the `album` key
    res.status(201).json({ album: newAlbum });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Update Album for a logged in user
export const updateMyAlbum = async (req: Request, res: Response): Promise<void> => {
  
  try {
    // Extract user ID from token
    const userId = getUserIdFromToken(req);
   
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      return;
    }

    console.log("Logged User ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

   
    const { id:albumId } = req.params;
    console.log(albumId)
    const {  title, description } = req.body;
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      res.status(400).json({ message: "Invalid or missing album ID" });
      return;
    }

    // Find the album by ID
    const album = await MyAlbum.findById(albumId);

    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }

    // Ensure the logged-in user owns this album
    if (album.user.toString() !== userId) {
      res.status(403).json({ message: "Forbidden: You can only update your own album" });
      return;
    }

    // Update only provided fields
    if (title) album.title = title;
    if (description) album.description = description;

    // Save updated album
    await album.save();

    console.log("Updated album:", album);

    // Ensure response includes the `album` key
    res.status(200).json({ album });
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET ALL ALBUMS OF THE LOGGED IN USER

export const getMyAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user ID from token
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      return;
    }

    console.log("Fetching albums for user ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch albums associated with the user
    const albums = await MyAlbum.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//GET ALL IMAGES AN ALBUM
export const getMyImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id:albumId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      console.log(albumId)
      res.status(400).json({ message: "Invalid album ID" });
      return;
    }

    const album = await MyAlbum.findById(albumId).populate("images");
    
    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }
    console.log("Album::FROM CONTROLLER", album)
    res.status(200).json(album.images);
  } catch (error) {
    console.error("Error fetching album images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { createMyAlbum, getMyAlbums,updateMyAlbum,getMyImages  };
