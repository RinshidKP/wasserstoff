import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.mjs";
import {
  signup,
  login,
  getUserDetails,
  logout,
  updateUsername,
} from "../controllers/authController.mjs";
import upload from "../middleware/uploadImage.mjs";
import { uploadImage } from "../controllers/imageController.mjs";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", authenticateToken, getUserDetails);
router.put("/update-username", authenticateToken, updateUsername);
router.post("/upload", upload.single("image"), uploadImage);
router.post("/logout", logout);

export default router;
