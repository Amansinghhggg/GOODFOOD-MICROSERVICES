import axios from "axios";
import { getBuffer } from "../config/dataUri.js";
import { AuthenticatedRequest, isOwner } from "../middleware/isAuth.js"
import tryCatch from "../middleware/trycatch.js"
import Restaurant from "../Models/restaurant.js";
import { MenuItem } from "../Models/MenuItems.js";
export const addMenuItem = async (req:AuthenticatedRequest, res:any) => {
    if(!req.user){
        res.status(401).json({message:"Unauthorized"})
        return;
    }
    const ownerId = req.user._id?.toString();
    if(!ownerId){
        res.status(401).json({message:"Unauthorized"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:ownerId})
    if(!restaurant){
        res.status(404).json({message:"Restaurant not found"})
        return;
    }
        const {name,description,price} = req.body;
        if(!name||!description||!price){
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
    const menuItem = {
        restaurantId: restaurant._id.toString(),
        name,
        description,
        price,
        image:uploadResult.url
    }
    const createdMenuItem = await MenuItem.create(menuItem);
    res.status(201).json({message:"Menu item added successfully",menuItem:createdMenuItem})
}

export const getAllMenuItems = tryCatch(async (req:AuthenticatedRequest, res:any) => {
    const {id} = req.params;
    if(!id){
        res.status(400).json({message:"Restaurant ID is required"})
        return;
    }
    const menuItems = await MenuItem.find({restaurantId:id});
    res.status(200).json({menuItems})
})

export const deleteMenuItem = tryCatch(async (req:AuthenticatedRequest, res:any) => {
    const {id} = req.params;
    if(!id){
        res.status(400).json({message:"Menu item ID is required"})
        return;
    }
    const menuItem = await MenuItem.findById(id);
    if(!menuItem){
        res.status(404).json({message:"Menu item not found"})
        return;
    }
    const ownerId = req.user?._id?.toString();
    if(!ownerId){
        res.status(401).json({message:"Unauthorized"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:ownerId});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant"})
        return;
    }
    if(restaurant.owner.toString() !== req.user?._id.toString()){
        res.status(403).json({message:"You are not authorized to delete this menu item"})
        return;
    }
    await MenuItem.findByIdAndDelete(id);
    res.status(200).json({message:"Menu item deleted successfully"})
})
    
export const editMenuItem = tryCatch(async (req:AuthenticatedRequest, res:any) => {
    const {id} = req.params;
    if(!id){
        res.status(400).json({message:"Menu item ID is required"})
        return;
    }
    const menuItem = await MenuItem.findById(id);
    if(!menuItem){
        res.status(404).json({message:"Menu item not found"})
        return;
    }
    const ownerId = req.user?._id?.toString();
    if(!ownerId){
        res.status(401).json({message:"Unauthorized"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:ownerId});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant  "})
        return;
    }
    if(restaurant.owner.toString() !== req.user?._id.toString()){
        res.status(403).json({message:"You are  "})
        return;
    }
    const {name,description,price} = req.body;
    const file = req.file;
    let imageUrl = menuItem.image;
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
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id,{
        name:name || menuItem.name,
        description:description || menuItem.description,
        price:price || menuItem.price,
        image:imageUrl
    },{new:true})
    res.status(200).json({message:"Menu item updated successfully",menuItem:updatedMenuItem})
})

export const isAvailableMenuItem = tryCatch(async (req:AuthenticatedRequest, res:any) => {
    const {id} = req.params;
    if(!id){
        res.status(400).json({message:"Menu item ID is required"})
        return;
    }
    const menuItem = await MenuItem.findById(id);
    if(!menuItem){
        res.status(404).json({message:"Menu item not found"})
        return;
    }
    const ownerId = req.user?._id?.toString();
    if(!ownerId){
        res.status(401).json({message:"Unauthorized"})
        return;
    }
    const restaurant = await Restaurant.findOne({owner:ownerId});
    if(!restaurant){
        res.status(404).json({message:"You don't have a restaurant"})
        return;
    }
    if(restaurant.owner.toString() !== req.user?._id.toString()){
        res.status(403).json({message:"You are not authorized to change availability of this menu item"})
        return;
    }
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    res.status(200).json({message:"Menu item availability updated successfully",menuItem})
})