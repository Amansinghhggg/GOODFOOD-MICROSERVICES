import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();


router.post("/upload", async (req, res) => {
    try {
        const{buffer} = req.body;
        const result = await cloudinary.v2.uploader.upload(buffer);
        res.json({url: result.secure_url});
    }catch (error) {
       res.status(500).json({message: "Error uploading image"});
     };
})

export default router;