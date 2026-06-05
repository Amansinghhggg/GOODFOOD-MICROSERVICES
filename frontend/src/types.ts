import React from "react";

export interface User {
    _id: string;
    name: string;
    email: string
    image: string;
    role: string;
}

export interface LocationData {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    fetchUser: () => Promise<void>;
    location: LocationData | null;
    setLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
    loadingLocation: boolean;
    setloadingLocation: React.Dispatch<React.SetStateAction<boolean>>;
    city: string;
    setcity: React.Dispatch<React.SetStateAction<string>>;
    cart: ICart | null;
    fetchCart: () => Promise<void>;
    subtotal: number;
    quantity: number;
    fetchLocation: () => Promise<void>;
}

export interface IRestaurant extends Document {
    _id: string;
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
export interface IMenuItem extends Document{
    _id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICart extends Document {
    userId:string;
    restaurantId:string | IRestaurant;
    itemsId:string | IMenuItem;
    quantity:number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder extends Document {
    _id: string;
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
|"preparing"
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