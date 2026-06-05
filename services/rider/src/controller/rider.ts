import axios from "axios";
import { getBuffer } from "../config/dataUri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import tryCatch from "../middleware/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    if(user.role!=="rider"){
        return res.status(403).json({
            message:"Only riders can create rider profile"
        })   
    }
    const file = req.file
    if(!file){
        return res.status(400).json({
            message:"Profile picture is required"
        })
    }
    const fileBuffer = getBuffer(file);
    if(!fileBuffer.content){
        return res.status(400).json({
            message:"failed to process profile picture"
        })
    }

    const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE_URL}`,{
        buffer:fileBuffer.content,
    })
       const {phoneNumber,aadharNumber,drivingLicenseNumber,latitude,longitude} = req.body;
       if(!phoneNumber || !aadharNumber || !drivingLicenseNumber || !latitude || !longitude){
        return res.status(400).json({
            message:"All fields are required"
        })
       }
    const existingProfile = await Rider.findOne({userId:user._id});
    if(existingProfile){
        return res.status(400).json({
            message:"Rider profile already exists"
        })
    }
    const rider = await  Rider.create({
        userId:user._id,
        picture:uploadResult.url,
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        location:{
            type:"Point",
            coordinates:[longitude,latitude]
        },
        isAvailable:false,
        isVerified:false,
    })

    return res.status(201).json({
        message:"Rider profile created successfully",
        rider
    })
})

export const fetchMyProfile = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    const account = await Rider.findOne({userId:user._id});
    if(!account){
        return res.status(404).json({
            message:"Rider profile not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Rider profile fetched successfully",
        account:account
})
})

export const toggleAvailability = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    const rider = await Rider.findOne({userId:user._id});
    if(!rider){
        return res.status(404).json({
            message:"Rider profile not found"
        })
    }
    const {isAvailable,latitude,longitude} = req.body;
    if(latitude===undefined||!longitude===undefined){
        return res.status(400).json({message:"location is required"})
    }
    if(isAvailable&&!rider.isVerified){
        return res.status(403).json({message:"Only verified riders can deliver orders"})
    }
    rider.isAvailable = !rider.isAvailable;
    rider.location = {
        type:"Point",
        coordinates:[longitude,latitude]
    }
    rider.lastActiveAt = new Date();
    await rider.save();
    return res.status(200).json({
        success:true,
        message: isAvailable? "Rider is now available for deliveries":"Rider is now unavailable for deliveries",
        rider
    })
})