import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import tryCatch from "../middleware/trycatch.js";
import Cart from "../Models/cart.js";

export const addToCart = tryCatch(async (req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    const { restaurantId, itemsId} = req.body;
   if(!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemsId)){
    return res.status(400).json({ message: "Invalid restaurantId or itemsId" });
   }
   const cartFromDiffRestau = await Cart.findOne({ userId, restaurantId:{$ne: restaurantId} });
    if(cartFromDiffRestau){
        return res.status(400).json({ message: "You have items from another restaurant in your cart. Please clear your cart before adding items from a different restaurant." });
    }
    const cartItem = await Cart.findOneAndUpdate(
        { userId, restaurantId, itemsId },
        { $inc: { quantity: 1 } },
        { upsert: true, new: true }
    );
    res.status(200).json({message:"Item Added To Cart Succesfully",cart:cartItem});
});

export const fetchCart = tryCatch(async (req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    const cartItems = await Cart.find({ userId }).populate("itemsId").populate("restaurantId");
    let subtotal = 0
    let cartLength = 0
    for(let cartItem of cartItems){
        const item:any = cartItem.itemsId;
        subtotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }
    res.status(200).json({ cart: cartItems, subtotal:subtotal, cartlength:cartLength });
});

export const clearCart = tryCatch(async (req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared successfully" });
});
export const removeFromCart = tryCatch(async (req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    const { restaurantId, itemsId } = req.body;
    if(!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemsId)){    
        return res.status(400).json({ message: "Invalid restaurantId or itemsId" });
    }
    const cartItem = await Cart.findOne({ userId, restaurantId, itemsId });
    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }
    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        await cartItem.save();
        res.status(200).json({ message: "Item quantity decreased by 1", cart: cartItem });
    } else {
        await Cart.deleteOne({ _id: cartItem._id });
        res.status(200).json({ message: "Item removed from cart" });
    }
});
