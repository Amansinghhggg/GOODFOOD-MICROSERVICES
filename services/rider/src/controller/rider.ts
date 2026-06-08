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

export const acceptOrder = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const riderUserId = req.user?._id;
    const {orderId} = req.params;
    if(!riderUserId){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    const rider = await Rider.findOne({userId:riderUserId});
    if(!rider){
        return res.status(404).json({
            message:"Rider profile not found"
        })
    }
    try {
        const {data} = await axios.put(`${process.env.RESTAURANT_SERVICE_URL}/api/order/assign/rider`,{
            orderId,
            riderId:rider._id.toString(),
            riderUserId:riderUserId,
            riderName:rider.picture,
            riderPhone:rider.phoneNumber
        },{
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY!
            }
        });
        if(data.success){
            const riderDetails = await Rider.findOneAndUpdate({
                userId:riderUserId,isAvailable:true
            },{isAvailable:false},{new:true});
            res.json({
                message:"Order accepted successfully",
                order:data.order,
                rider:riderDetails
            })
        } 
    } catch (error:any) {
    console.log("ASSIGN ORDER ERROR:");
    console.log(error?.response?.data);
    console.log(error?.message);

    return res.status(500).json({
        message:"Error occurred while assigning order",
        error: error?.response?.data || error?.message
    })
}
})

export const fetchMyCurrentOrder = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const riderUserId = req.user?._id;
    if(!riderUserId){
        return res.status(401).json({ message:"Unauthorized" });
    }
    const rider = await Rider.findOne({userId:riderUserId});
    if(!rider){
        return res.status(404).json({ message:"Rider profile not found" });
    }
    try {
        const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE_URL}/api/order/current/rider?riderId=${rider._id}`,{
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY!
            }
        });
        if(data.success){
            res.json({order:data.order})
        }
        } catch (error: any) {
            return res.status(500).json({
                message:error.response.data.message
            })
         }
})

export const updateOrderStatus = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const UserId = req.user?._id;
    if(!UserId){
        return res.status(401).json({ message:"Unauthorized" });
    }
    const rider = await Rider.findOne({userId:UserId});
    if(!rider){
        return res.status(404).json({ message:"Rider profile not found" });
    }
    const {orderId} = req.params;
    try {
        const {data} = await axios.put(`${process.env.RESTAURANT_SERVICE_URL}/api/order/update/status/${orderId}`,{
            orderId,},
            {
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY
            }
        });
        res.json({success:true, message:"Order status updated successfully", order:data.order});
    } catch (error) {
        return res.status(500).json({
            error,
            message:"Error occurred while updating order status"
        })
    }
})

export const verifyOtp = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const UserId = req.user?._id;
    if(!UserId){
        return res.status(401).json({ message:"Unauthorized" });
    }
    const rider = await Rider.findOne({userId:UserId});
    if(!rider){
        return res.status(404).json({ message:"Rider profile not found" });
    }
    const {orderId} = req.params;
    const {otp} = req.body;
    if(!otp){
        return res.status(400).json({message:"OTP is required"})
    }
    try { const {data} = await axios.post(`${process.env.RESTAURANT_SERVICE_URL}/api/order/verify/otp/${orderId}`,{
            otp,
            riderId:rider._id.toString()
        },{
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY
            }
        });
        if(data.success){
            res.json({ success:true, message:"OTP verified successfully"})
        } else {
            res.status(400).json({message:"Invalid OTP"})
        }
    } catch (error) {
        return res.status(500).json({
            error,
            message:"(rider)Error occurred while verifying OTP"
        })
    }
})

export const todayRiderEarnings = tryCatch(async(req:AuthenticatedRequest,res)=>{
       const UserId = req.user?._id;
    if(!UserId){
        return res.status(401).json({ message:"Unauthorized" });
    }
    const rider = await Rider.findOne({userId:UserId});
    if(!rider){
        return res.status(404).json({ message:"Rider profile not found" });
    } 
    try { const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE_URL}/api/order/rider/today/earnings/${rider._id}`,{
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY
            }
        });
            res.json({ success:true, totalOrders: data.totalOrders, totalEarnings: data.totalEarnings })
    } catch (error) {
        return res.status(500).json({
            error,
            message:"(rider)Error occurred while verifying OTP"
        })
    }
})

export const fetchRiderTotalEarnings = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const UserId = req.user?._id;
    if(!UserId){
        return res.status(401).json({ message:"Unauthorized" });
    }
    const rider = await Rider.findOne({userId:UserId});
    if(!rider){
        return res.status(404).json({ message:"Rider profile not found" });
    }
    try { const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE_URL}/api/order/rider/total/earnings/${rider._id}`,{
            headers:{
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY
            }        });
            res.json({ success:true, TotalOrders: data.totalOrders, TotalEarnings: data.totalEarnings })
    } catch (error) {
        return res.status(500).json({
            error,
            message:"(rider)Error occurred while fetching total earnings"
        })
    }
})



