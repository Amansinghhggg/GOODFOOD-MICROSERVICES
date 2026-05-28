import express from 'express';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import cors from 'cors';
import upload from './routes/cloudinary';

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));
const PORT = process.env.PORT || 3002

const {CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET} = process.env
if(!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME){
    console.error("Cloudinary configuration is missing. Please check your .env file.");
    process.exit(1);
}
cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})
app.use("/api/cloudinary", upload);
app.listen(PORT,()=>{
    console.log(`utils is running on ${PORT}`)
})