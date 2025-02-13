import {Router} from "express";
import MyImageController from "../controllers/MyImageController";
import uploadMiddleware from "../middlewares/uploadMiddleware";
const router =Router();

router.post("/upload-image/:id", uploadMiddleware, MyImageController.uploadImagesToAlbum);


export default router;