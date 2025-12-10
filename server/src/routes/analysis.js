import { Router } from "express";
import {
  transcribeMedia,
  generateFeedback,
} from "../controllers/analysisController.js";

const router = Router();

router.post("/transcribe", transcribeMedia);
router.post("/feedback", generateFeedback);

export default router;

