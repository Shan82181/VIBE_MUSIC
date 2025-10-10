import express from 'express';
import { getHomeData } from '../services/innertubeService.js';
const router = express.Router();

router.get('/home', async (req, res) => {
  try {
    const data = await getHomeData(); 
    res.json(data);
  }
  catch (err) {
    console.error('Home data error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
)

export default router;