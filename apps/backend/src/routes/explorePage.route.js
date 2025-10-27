import express from 'express';
import { getExplore } from '../services/innertubeService.js';
const router = express.Router();

router.get("/explore", async (_, res) => {
  try {
    const data = await getExplore();
    res.json(data);
  } catch (err) {
    console.error('Home data error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});
export default router;