import { ObjectId } from "mongodb";
import tryCatch from "../middleware/trycatch.js";
import { getRestaurantCollection, getRiderCollection } from "../utils/collections.js";

export const getPendingRestaurants = tryCatch(async (req, res) => {
    const unVerifiedRestaurants = await ( await getRestaurantCollection())
    .find({ isVerified: false }).toArray();
    res.json({
        count: unVerifiedRestaurants.length,
        restaurants: unVerifiedRestaurants
    });
});

export const getPendingRiders = tryCatch(async (req, res) => {
    const unVerifiedRiders = await ( await getRiderCollection())
    .find({ isVerified: false }).toArray();
    res.json({
        count: unVerifiedRiders.length,
        riders: unVerifiedRiders
    });
});

export const verifyRestaurant = tryCatch(async (req, res) => {
    const { id } = req.params;
   if(typeof id !== 'string' || !ObjectId.isValid(id)){
    res.status(400).json({message:"Invalid restaurant id"});
    return;
   }
    const result = await (await getRestaurantCollection())
    .updateOne({ _id: new ObjectId(id) }, { $set: { isVerified: true ,updated_at: new Date() } });
    if(result.matchedCount === 0){
        res.status(404).json({message:"Restaurant not found or already verified"});
        return;
    }
    res.json({success:true, message:"Restaurant verified successfully"});
});

export const verifyRider = tryCatch(async (req, res) => {
    const { id } = req.params;
    if(typeof id !== 'string' || !ObjectId.isValid(id)){
        res.status(400).json({message:"Invalid rider id"});
        return;
       }
    const result = await (await getRiderCollection())
    .updateOne({ _id: new ObjectId(id) }, { $set: { isVerified: true ,updated_at: new Date() } });
    if(result.matchedCount === 0){
        res.status(404).json({message:"Rider not found or already verified"});
        return;
    }
    res.json({success:true, message:"Rider verified successfully"});
});

