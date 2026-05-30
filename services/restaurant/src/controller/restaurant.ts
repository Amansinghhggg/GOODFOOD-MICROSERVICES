import {AuthenticatedRequest} from "../middleware/isAuth.js";  
import tryCatch from "../middleware/trycatch.js";
import Restaurant from "../Models/restaurant.js";
import { getBuffer } from "../config/dataUri.js";
import axios from "axios";
import jwt from "jsonwebtoken";
export const addRestaurant = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        res.status(401).json({message:"Please Login"})
        return;
    }
    const existingRestaurant = await Restaurant.findOne({owner:user._id});
    if(existingRestaurant){
        res.status(400).json({message:"You already have a restaurant"})
        return;
    }
    const {name,description,latitude,longitude,formattedAddress,phone} = req.body;
    if(!name || !description || !latitude || !longitude || !formattedAddress || !phone){
        res.status(400).json({message:"All fields are required"})
        return;
    }
    const file = req.file;
    if(!file){
        res.status(400).json({message:"Image is required"})
        return;
    }
    const fileBuffer = getBuffer(file);
    if(!fileBuffer?.content){
        return res.status(500).json({message:"failed to create buffer"})
    }

    const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE_URL}`,{
        buffer:fileBuffer.content
    })
    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image:uploadResult.url,
        owner:user._id,
        autoLocation:{
            type:"Point",
            coordinates:[Number(longitude),Number(latitude)],
            formattedAddress
        },
    })
    res.status(201).json({message:"Restaurant created successfully",restaurant})
})

export const fetchMyRestaurant = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        res.status(401).json({message:"Please Login"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:user._id});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant"})
        return;
    }
    if(!user.restaurantId){
       const token = jwt.sign({user:{...user,restaurantId:restaurant._id}},
        process.env.JWT_SECRET as string,{expiresIn:"7d"});
        return res.json({restaurant,token});
    }
    res.json({restaurant})
}
)

export const editRestaurant = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        res.status(401).json({message:"Please Login"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:user._id});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant"})
        return;
    }
    const {name,description,latitude,longitude,formattedAddress,phone} = req.body;
    if(!name || !description || !latitude || !longitude || !formattedAddress || !phone){
        res.status(400).json({message:"All fields are required"})
        return;
    }
    const file = req.file;
    let imageUrl = restaurant.image;
    if(file){
        const fileBuffer = getBuffer(file);
        if(!fileBuffer?.content){
            return res.status(500).json({message:"failed to create buffer"})
        }
        const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE_URL}`,{
            buffer:fileBuffer.content
        })
        imageUrl = uploadResult.url;
    }
    restaurant.name = name;
    restaurant.description = description;
    restaurant.phone = phone;
    restaurant.image = imageUrl;
    restaurant.autoLocation = {
        type:"Point",
        coordinates:[Number(longitude),Number(latitude)],
        formattedAddress
    }
    await restaurant.save();
    res.json({message:"Restaurant updated successfully",restaurant})
})

export const isOpenRestaurant = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        res.status(401).json({message:"Please Login"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:user._id});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant"})
        return;
    }
    const value = restaurant.isOpen;
    restaurant.isOpen = !value;
    restaurant.save();
    res.json({message:`Restaurant is now ${restaurant.isOpen ? "open" : "closed"}`})
})
export const getnearbyRestaurants = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const {latitude,longitude,search="",radius=5000} = req.query;
    if(!latitude || !longitude){
        res.status(400).json({message:"latitude and longitude are required"})
        return;
    }
   const query:any = {
     isVerified:true
   }
    if(search && typeof search === "string"){
        query.name = {$regex:search,$options:"i"}
    }
    const restaurants = await Restaurant.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                distanceField: "distance",
                maxDistance:Number(radius),
                spherical: true,
                query
            }
        },{
            $sort: {isOpen:-1, distance: 1 }
        },{
            $addFields: {distanceKm: { $round: [{$divide: ["$distance", 1000]}, 2] } }

        }
    ])
        res.json({success:true,count:restaurants.length,restaurants})
});

export const fetchSingleRestaurant = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    if(!restaurant){
        res.status(404).json({message:"Restaurant not found"})
        return;
    }
    res.json({restaurant})
})