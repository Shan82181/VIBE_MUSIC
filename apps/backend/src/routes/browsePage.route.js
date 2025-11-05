import express from 'express';
import { getBrowseData} from '../services/innertubeService.js';
const router = express.Router();

router.get("/browse", async (req, res) => {
  try {
    const { browseId, params } = req.query;
    const data = await getBrowseData(browseId, params);
    res.json(data);
  } catch (err) {
    console.error("Browse error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
export default router;