import express from 'express';
import { getBrowseData} from '../services/innertubeService.js';
const router = express.Router();

router.get("/browse/:browseId", async (req, res) => {
  try {
    const data = await getBrowseData(req.params.browseId);
    res.json(data);
  } catch (err) {
    console.error("Browse error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
export default router;