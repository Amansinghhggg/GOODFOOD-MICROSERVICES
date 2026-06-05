import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService, restaurantService } from "../main";
import { type ICart, type AppContextType, type LocationData, type User } from "../types";
import toast from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setloadingLocation] = useState(false);
    const [city, setcity] = useState("fetching city...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(data.user);
            setIsAuth(true);
        } catch (error) {
            console.log("Error fetching user:", error);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser or access denied.");
            return;
        }
        setloadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const token = localStorage.getItem("token");
                    // Use backend proxy to avoid CORS issues
                    const resp = await axios.get(`${authService}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = resp.data?.data || resp.data;
                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: data.display_name || "Current Location"
                    });
                    setcity(data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown City");
                    setloadingLocation(false);
                } catch (error) {
                    const fallbackData = (axios.isAxiosError(error) ? error.response?.data?.data : undefined) as any;
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        formattedAddress: fallbackData?.display_name || "Current Location",
                    });
                    setcity(
                        fallbackData?.address?.city ||
                        fallbackData?.address?.town ||
                        fallbackData?.address?.village ||
                        fallbackData?.address?.county ||
                        "Unknown City"
                    );
                  
                    console.log("Error fetching location data (possible CORS/network):", error);
                    setloadingLocation(false);
                }
            },
            (geoErr) => {
                console.log("Geolocation error:", geoErr);
                setloadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
        
    }, []);
     const [cart, setcart] = useState<ICart[]| null>([]);
     const [subtotal, setsubtotal] = useState(0);
     const [quantity, setquantity] = useState(0);
    async function fetchCart() {
    try {
        const {data} = await axios.get(`${restaurantService}/api/cart/all`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        console.log("Cart data fetched:", data);
        setcart(data.cart);
        setsubtotal(data.subtotal);
        setquantity(data.cartlength);
    } catch (error) {
        console.log("Error fetching cart:", error);
    }
    }
    useEffect(() => {
        if (user&& user.role === "customer") {
            fetchCart();
        }
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                user,
                loading,
                isAuth,
                setUser,
                setIsAuth,
                setLoading,
                fetchUser,
                location,
                setLocation,
                loadingLocation,
                setloadingLocation,
                city,
                setcity,
                cart,
                fetchCart,
                subtotal,
                quantity,
            } as AppContextType}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};