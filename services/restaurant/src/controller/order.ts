import { AuthenticatedRequest } from "../middleware/isAuth.js";
import tryCatch from "../middleware/trycatch.js";
import address from "../Models/address.js";
import Cart from "../Models/cart.js";
import { IMenuItem } from "../Models/MenuItems.js";
import { Order } from "../Models/order.js";
import Restaurant from "../Models/restaurant.js";

export const createOrder = tryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if(!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const {paymentMethod,addressId,distance}= req.body;

    if(!addressId){
        return res.status(400).json({ message: "Address is required" });
    }
    if(typeof distance !== "number" || Number.isNaN(distance) || distance < 0){
        return res.status(400).json({ message: "Distance is required" });
    }
    const Address = await address.findById(addressId);
    if(!Address){
        return res.status(404).json({ message: "Address not found" });
    }
    const cartItems = await Cart.find({ userId: user._id }).populate<{itemsId: IMenuItem}>("itemsId").populate("restaurantId");
    if(cartItems.length === 0){
        return res.status(400).json({ message: "Cart is empty" });
    }
     const firstCartItem = cartItems[0];
    if(!firstCartItem || !firstCartItem.restaurantId){
        return res.status(400).json({ message: "Invalid cart item" });
    }
    const restaurant = await Restaurant.findById(firstCartItem.restaurantId);
    if(!restaurant){
        return res.status(404).json({ message: "Restaurant not found" });
    }
    if(!restaurant.isOpen){
        return res.status(400).json({ message: "Restaurant is closed for now" });
    }
    let subtotal = 0;
    const items = cartItems.map(cartItem => {
        if(!cartItem.itemsId){
            throw new Error("Invalid cart item");
        }
        const item = cartItem.itemsId;
        const itemTotal = item.price * cartItem.quantity;
        subtotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cartItem.quantity,
        }
    });
    const deliveryFee = subtotal <250 ? 49 : 0;
    const platformFee = 7
    const totalAmount = subtotal + deliveryFee + platformFee;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [longitude,latitude] =  Address.location.coordinates;
    const riderAmount = Math.ceil(distance)*17 ;
    const order = await Order.create({
        userId: user._id,
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        riderAmount: riderAmount,
        distance: distance,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        platformFee: platformFee,
        totalAmount: totalAmount,
        addressId: Address._id.toString(),
        deliveryAddress: {
            formattedAddress: Address.formattedAddress,
            mobile: Address.mobile,
            latitude: latitude,
            longitude: longitude,
        },
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expiresAt: expiresAt,
    });

    await Cart.deleteMany({ userId: user._id });

    res.json({ message: "Order placed successfully", orderId: order._id.toString(),amount: totalAmount });
})
export const fetchOrders = tryCatch(async(req,res)=>{
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){
        return res.status(401).json({ message: "Unauthorized" });
    }
    const order = await Order.findById(req.params.id);
    if(!order){
        return res.status(404).json({ message: "Order not found" });
    }
    if(order.paymentStatus !== "pending"){
        return res.status(400).json({ message: "Order is already paid " });
    }
    res.json({ orderId: order._id, amount: order.totalAmount, currency: "INR" });
})