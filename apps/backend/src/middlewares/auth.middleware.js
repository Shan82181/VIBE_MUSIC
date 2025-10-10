// middlewares/auth.middleware.js
import { requireAuth, getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export const verifyClerkJWT = requireAuth();

// Attach user from database
export const attachUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not synced",
        message: "Please complete user sync first" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Attach user error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};