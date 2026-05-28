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
}

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
