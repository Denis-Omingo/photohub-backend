import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import MyAlbum from "../models/album";
import MyImage from "../models/image";

const SECRET_KEY = process.env.JWT_SECRET || "secret-key";


export const getUserIdFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    return decoded?.userId || null;
  } catch (error) {
    console.error("Invalid Token:", error);
    return null;
  }
};

const uploadImagesToAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Incoming request to upload an image");

    const userId = getUserIdFromToken(req);
    if (!userId) {
      console.error("Unauthorized: Missing or invalid token");
      res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const { id: albumId } = req.params;
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      res.status(400).json({ error: "Invalid album ID" });
      return;
    }

    const album = await MyAlbum.findOne({ _id: albumId, user: userId });
    if (!album) {
      res.status(404).json({ error: "Album not found or does not belong to the user" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "An image file is required" });
      return;
    }

    const file = req.file;

    
    const filePath = `/uploads/${file.filename}`;

    // Create new image
    const newImage = new MyImage({
      filename: file.filename || "",
      filePath,
      album: albumId,
    });

    const savedImage = await newImage.save();

    // Fix: Store ObjectId, not file path
    album.images?.push(savedImage._id);

    // Save the album with the updated images array
    await album.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      image: savedImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export default { uploadImagesToAlbum };
