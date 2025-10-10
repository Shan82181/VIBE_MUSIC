// routes/auth.routes.js
import express from "express";
import { verifyClerkJWT, attachUser } from "../middlewares/auth.middleware.js";
import { syncUser, getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route is working" });
});

// Sync user - creates or updates user in MongoDB
router.post("/sync", verifyClerkJWT, syncUser);

// Get current user - requires user to be synced
router.get("/me", verifyClerkJWT, attachUser, getCurrentUser);

export default router;