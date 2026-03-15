import express from "express";
import { protect } from "../configs/middlewares/authMiddleware.js";
import {
  createresume,
  deleteresume,
  getPublicResumeById,
  getResumeById,
  updateResume,
  getUserResume
} from "../controllers/resumeController.js";

import upload from "../configs/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", protect, createresume);
resumeRouter.put("/update", upload.single("image"), protect, updateResume);
resumeRouter.delete("/delete/:resumeId", protect, deleteresume);

resumeRouter.get("/user-resumes", protect, getUserResume);  // ⭐ IMPORTANT
resumeRouter.get("/get/:resumeId", protect, getResumeById);
resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;