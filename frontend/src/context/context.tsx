import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../main";
import type { AppContextType, LocationData, User } from "../types";
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
                // Use backend proxy to avoid CORS issues
                console.log(`Fetching location data for lat: ${latitude}, lon: ${longitude}`);
                const resp = await axios.get(`${authService}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
                const data = resp.data?.data || resp.data;
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "Current Location"
                });
                setcity(data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown City");
                setloadingLocation(false);
                } catch (error) {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        formattedAddress: "Current Location",
                    });
                  
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
            }}
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