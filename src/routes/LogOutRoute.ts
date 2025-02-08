import express from "express";
import MyUserController from "../controllers/MyUserController";

const router = express.Router();

router.post("/", MyUserController.logoutUser ); 

export default router;