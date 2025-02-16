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

//Upload image to album
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

//Get images of a logged in user 
const getUserImages = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching all images for the logged-in user");

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

    // Find all albums owned by the user
    const userAlbums = await MyAlbum.find({ user: userId }).select("_id");

    if (!userAlbums.length) {
      res.status(200).json([]); // Return an empty array if user has no albums
      return;
    }

    const albumIds = userAlbums.map(album => album._id);

    // Find all images that belong to the user's albums
    const images = await MyImage.find({ album: { $in: albumIds } }).sort({ createdAt: -1 });

    res.status(200).json(images);
    console.log(images);
  } catch (error) {
    console.error("Error fetching user images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


//Update title of selected image of a current user
const updateMyImage = async (req: Request, res: Response): Promise<void> => {
  console.log("UPDATE USER REQUEST INITIATED")
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing token" });
      return;
    }

    const { id:imageId } = req.params;
    const { name: newName } = req.body;

    if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
      res.status(400).json({ success: false, message: "Invalid image ID" });
      return;
    }

    if (!newName) {
      res.status(400).json({ success: false, message: "New name is required" });
      return;
    }

    const image = await MyImage.findById(imageId);
    if (!image) {
      res.status(404).json({ success: false, message: "Image not found" });
      return;
    }

    // Ensure the user owns the image by checking the album ownership
    const album = await MyAlbum.findOne({ _id: image.album, user: userId });
    if (!album) {
      res.status(403).json({ success: false, message: "Forbidden: You do not own this image" });
      return;
    }

    image.filename = newName;
    await image.save();

    res.status(200).json({
      success: true,
      message: "Image name updated successfully",
      updatedImage: {
        _id: image._id.toString(),
        name: newName,
        filename: image.filename,
        filePath: image.filePath,
      },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export default { uploadImagesToAlbum, getUserImages, updateMyImage };
