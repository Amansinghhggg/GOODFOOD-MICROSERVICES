import mongoose ,{Schema,Document} from "mongoose";
export interface IRestaurant extends Document {
    name: string;
    description?: string;
    image: string;     
    owner: string;
    phone : number;
    isVerified: boolean;
    autoLocation: {
        type:"Point",
        coordinates:[number,number];
        formattedAddress:String;
    }
    isOpen: boolean;
    createdAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>({
    name: { type: String, required: true,trim:true },
    description:String ,
    image: { type: String, required: true },
    owner: { type:String, required: true },
    phone: { type: Number,match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], required: true },
    isVerified: { type: Boolean, required: true, default: false },
    autoLocation: {
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
    },
    formattedAddress:String
    },
    isOpen: { type: Boolean, required: true, default: false },
},{
    timestamps:true
});

restaurantSchema.index({ autoLocation: '2dsphere' });

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
export default Restaurant;