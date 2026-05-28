import mongoose, { Document } from "mongoose";

export interface IMenuItem extends Document{
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new mongoose.Schema<IMenuItem>({
    restaurantId: { type: String, required: true,ref:"Restaurant",index:true },
    name: { type: String, required: true ,trim:true},
    description:{ type: String, required: true ,trim:true},
    image: { type: String, required: true },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
}, {
    timestamps: true
});

export const MenuItem = mongoose.model<IMenuItem>("MenuItem", schema);