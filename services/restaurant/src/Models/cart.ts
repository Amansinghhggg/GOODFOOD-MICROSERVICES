import mongoose, { Document, mongo } from "mongoose";

export interface ICart extends Document {
    userId:mongoose.Types.ObjectId;
    restaurantId:mongoose.Types.ObjectId;
    itemsId:mongoose.Types.ObjectId;
    quantity:number;
    createdAt: Date;
    updatedAt: Date;
}
const schema = new mongoose.Schema<ICart>({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User", index: true },
    restaurantId: { type: mongoose.Types.ObjectId, required: true, ref: "Restaurant", index: true },
    itemsId: { type: mongoose.Types.ObjectId, required: true, ref: "MenuItem", index: true },
    quantity: { type: Number,default: 1,min: 1 },
}, { timestamps: true });

schema.index({ userId: 1, restaurantId: 1, itemsId: 1 }, { unique: true });

const Cart = mongoose.model<ICart>("Cart", schema);

export default Cart;