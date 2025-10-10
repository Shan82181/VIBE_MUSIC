import express from 'express';
import axios from 'axios';
import User from '../models/user.model.js';
import { verifyToken } from "@clerk/express";


const router = express.Router();


// POST /api/sync-user/:clerkId
router.post('/sync-user/:clerkId', async (req, res) => {
const { clerkId } = req.params;
const token = req.headers.authorization?.split(' ')[1];


try {
// 1️⃣ Verify Clerk token (security check)
const decoded = await verifyToken(token, {
secretKey: process.env.CLERK_SECRET_KEY,
});


if (!decoded.sub || decoded.sub !== clerkId) {
return res.status(401).json({ error: 'Invalid or mismatched token' });
}


// 2️⃣ Fetch user from Clerk API
const response = await axios.get(`https://api.clerk.dev/v1/users/${clerkId}`, {
headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
});


const data = response.data;


// 3️⃣ Extract the needed fields
const email = data.email_addresses?.[0]?.email_address;
const firstName = data.first_name;
const lastName = data.last_name;
const imageUrl = data.image_url;


// 4️⃣ Create or update MongoDB user
const user = await User.findOneAndUpdate(
{ clerkId },
{ clerkId, email, firstName, lastName, imageUrl },
{ upsert: true, new: true }
);


console.log('✅ User synced:', user.email);
return res.json({ success: true, user });
} catch (err) {
console.error('❌ Error syncing user:', err.message);
return res.status(500).json({ error: 'Failed to sync user' });
}
});


export default router;