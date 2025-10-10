// controllers/auth.controller.js
import User from "../models/user.model.js";
import { clerkClient } from "@clerk/express";

// Sync Clerk user into MongoDB
export const syncUser = async (req, res) => {
  try {
    const clerkUser = await clerkClient.users.getUser(req.auth.userId);
    
    let user = await User.findOne({ clerkId: req.auth.userId });
    const email = clerkUser.primaryEmailAddress?.emailAddress || 
                  clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return res.status(400).json({ error: "User email not found" });
    }

    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    if (!user) {
      // Create new user
      user = new User({
        clerkId: req.auth.userId,
        username: clerkUser.username || 
                 `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}` ||
                 email.split('@')[0],
        email: email,
        profileImage: clerkUser.imageUrl,
        role: role,
      });
      await user.save();
      console.log("New user created:", user.email);
    } else {
      // Update existing user
      user.username = clerkUser.username || 
                     `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}` ||
                     user.username;
      user.email = email;
      user.profileImage = clerkUser.imageUrl;
      user.role = role;
      await user.save();
      console.log("User updated:", user.email);
    }

    res.json(user);
  } catch (err) {
    console.error("Sync user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: err.message });
  }
};