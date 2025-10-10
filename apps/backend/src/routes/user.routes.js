import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
    req.send("User route is working");
})


export default router;