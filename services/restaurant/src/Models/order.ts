import mongoose,{Document} from "mongoose";
export interface IOrder extends Document {
    userId: String;
    restaurantId: String;
    restaurantName: String;
    riderId: String |null;
    riderPhone: String | null;
    riderName: String | null;
    distance:Number ;
    riderAmount:Number;
    items: {
        itemId: String;
        name: String;
        price: Number;
        quantity: Number;
    }[];
    subtotal: Number;
    deliveryFee:Number;
    platformFee:Number;
    totalAmount:Number;
    addressId:String;

    deliveryAddress:{
        formattedAddress:String;
        mobile:Number;
        latitude:Number;
        longitude:Number;
    };

    status:
| "placed"
|"accepted"
|"preaparing"
|"ready_for_rider"
|"rider_assigned"
|"picked_up"
|"delivered"
| "cancelled";

paymentMethod: "razorpay" | "stripe";
paymentStatus: "pending" | "paid" | "failed";

expiresAt:Date;

createdAt:Date;
updatedAt:Date;
}

const schema = new mongoose.Schema<IOrder>({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    riderId: { type: String, default: null },
    riderPhone: { type: String, default: null },
    riderName: { type: String, default: null },
    riderAmount: { type: Number, required: true },
    distance: { type: Number, required: true },
    items: [
        {
            itemId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    addressId: { type: String, required: true },
    deliveryAddress: {
        formattedAddress: { type: String, required: true },
        mobile: { type: Number, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    status: {
        type: String,
        enum: ["placed",
        "accepted",
        "preaparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled"],
        default: "placed",
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },
    expiresAt: { type: Date, index:{ expires:'0'}, required: true },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>("Order", schema);