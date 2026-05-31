import { AuthenticatedRequest } from "../middleware/isAuth.js";
import tryCatch from "../middleware/trycatch.js";
import address from "../Models/address.js";

export const addAddress =  tryCatch(async (req:AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const {mobile,formattedAddress,latitude,longitude} = req.body;
    if(!mobile || !formattedAddress || !latitude || !longitude){
        return res.status(400).json({ message: "All fields are required" });
    }
    const newAddress = await address.create({
        userId: user._id,
        mobile,
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
    });
    res.status(201).json({ message: "Address added successfully", address: newAddress });
});

export const deleteAddress = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({message:"You are Not Authorized"})
    }
    const {id} = req.params
    if(!id){
        return res.status(400).json({message:"id is required"})
    }
    const addressToDelete = await address.findOne({_id:id,userId:user._id});
    if(!addressToDelete){
        return res.status(404).json({message:"Address Not Found"})
    }
    await address.findByIdAndDelete(id);
    res.status(200).json({message:"Address Deleted Successfully"})
})

export const getMyAddresses = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({message:"You are Not Authorized"})
    }
    const addresses = await address.find({userId:user._id}).sort({createdAt:-1});
    res.status(200).json({addresses});
})

