import {Router} from "express";
import MyUserController from "../controllers/MyUserController";
import MyAlbumController from "../controllers/MyAlbumController";

const router =Router();

router.post("/", MyAlbumController.createMyAlbum);
router.get("/",MyAlbumController.getMyAlbums)
router.put("/:id",MyAlbumController.updateMyAlbum)
router.get("/:id/images",MyAlbumController.getMyImages)

export default router;