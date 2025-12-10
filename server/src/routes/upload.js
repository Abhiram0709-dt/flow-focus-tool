import { Router } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import { uploadMedia } from "../controllers/uploadController.js";

const router = Router();

const upload = multer({
  dest: path.join(os.tmpdir(), "communication-coach-uploads"),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
  },
});

router.post("/", upload.single("file"), uploadMedia);

export default router;

