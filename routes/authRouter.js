import { Router } from "express";
import * as auth from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", authMiddleware, auth.logout);
router.get("/current", authMiddleware, auth.current);
router.patch("/subscription", authMiddleware, auth.updateSubscription);

// PATCH /api/auth/avatars  (form-data: avatar=<file>)
router.patch("/avatars", authMiddleware, upload.single("avatar"), auth.updateAvatar);

export default router;
