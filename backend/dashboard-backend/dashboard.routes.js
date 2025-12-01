import { Router } from "express";
import { getDashboardStats, getRecentActivity, createQuickTask } from "./dashboard.controller.js";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);
router.post("/task", createQuickTask);

export default router;