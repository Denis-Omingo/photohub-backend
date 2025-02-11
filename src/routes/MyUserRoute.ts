import {Router} from "express";
import MyUserController from "../controllers/MyUserController";

const router =Router();

router.post("/", MyUserController.createCurrentUser );
router.get("/", MyUserController.getCurrentUser );  
router.put('/', MyUserController.updateCurrentUser)

export default router;