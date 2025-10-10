// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    imageUrl: String, // Fixed: was fullName in schema but username in controller
    email: { type: String, required: true, unique: true },
 // Fixed: was imageUrl in schema but profileImage in controller
    clerkId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
