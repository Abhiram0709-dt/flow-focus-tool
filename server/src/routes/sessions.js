import { Router } from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} from "../controllers/sessionsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All session routes require authentication
router.use(authenticate);

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.delete("/:id", deleteSession);

export default router;

