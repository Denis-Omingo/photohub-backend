import {Router} from "express";
import MyAlbumController from "../controllers/MyAlbumController";

const router =Router();

router.post("/", MyAlbumController.createMyAlbum);
router.get("/",MyAlbumController.getMyAlbums)
router.get("/get-albums/:id",MyAlbumController.getUserAlbums)
router.put("/:id",MyAlbumController.updateMyAlbum)
router.get("/:id/images",MyAlbumController.getMyImages)

export default router;