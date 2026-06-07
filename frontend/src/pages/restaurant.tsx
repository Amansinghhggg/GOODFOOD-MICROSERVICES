import { useEffect, useRef, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import CreateRestaurant from "../components/restaurant/createRestaurant";
import YourRestaurant from "../components/restaurant/YourRestaurant";
import { useSocket } from "../context/socketContext";
import restaurantNotifySound from "../Assets/50986408-what-meme-388653.mp3";
import toast from "react-hot-toast";
const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState<boolean>(false);

    const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => {
        try {
            return localStorage.getItem("audioEnabled") === "true";
        } catch {
            return false;
        }
    });

    const [showAudioPrompt, setShowAudioPrompt] = useState<boolean>(() => {
        try {
            return localStorage.getItem("audioPromptDismissed") !== "true";
        } catch {
            return true;
        }
    });

    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const { socket } = useSocket();

    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function fetchRestaurant() {
        setLoading(true);

        try {
            const response = await axios.get(
                `${restaurantService}/api/restaurant/my`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setRestaurant(response.data.restaurant || null);
        } catch (error) {
            console.error("Error fetching restaurant:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRestaurant();
    }, []);

    useEffect(() => {
        audioRef.current = new Audio(restaurantNotifySound);
        audioRef.current.load();
        audioRef.current.volume = 1;
        audioRef.current.muted = false;
    }, []);

    const unlockAudio = () => {
        if (!audioRef.current) return;

        audioRef.current.play()
            .then(() => {
                audioRef.current?.pause();
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                }

                setAudioUnlocked(true);

                try {
                    localStorage.setItem("audioEnabled", "true");
                } catch {}

                setShowAudioPrompt(false);
            })
            .catch(() => {});
    };

    const handleToggle = async () => {
        try {
            await axios.put(
                `${restaurantService}/api/restaurant/is-open`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            await fetchRestaurant();
        } catch (err) {
            console.error("Failed to toggle open state", err);
        }
    };

     useEffect(() => {
        if (!socket || !restaurant?._id) return;

        try {
            socket.emit(
                "join_room",
                `restaurant:${restaurant._id}`,
                (res: any) => {
                    console.log("join_room ack", res);
                }
            );
        } catch (err) {
            console.error("Failed to emit join_room", err);
        }

        const newOrder = () => {
            toast.success("New order received");

            setToastMsg("New order received");
            setReload((prev) => !prev);
            
            setTimeout(() => {
                setToastMsg(null);
            }, 3000);

            if (audioRef.current) {
                audioRef.current.currentTime = 0;

                audioRef.current.play().catch(() => {});
            }
        };

        socket.on("order_new", newOrder);
        return () => {
            socket.off("order_new", newOrder);
        };
    }, [socket, restaurant?._id]);

    if (loading) {
        return (
            <div className="h-16 flex items-center justify-center bg-gray-200">
                Loading...
            </div>
        );
    }

    if (!restaurant) {
        return <CreateRestaurant />;
    }

    return (
        <div className="space-y-6">
            {!audioUnlocked && showAudioPrompt && (
                <div className="relative flex items-start gap-4 p-4 rounded-md bg-white shadow-md border border-gray-200">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                            Enable notifications for new orders
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                            Allow sound so you'll immediately hear new incoming
                            orders.
                        </p>

                        <button
                            onClick={unlockAudio}
                            className="mt-3 px-3 py-2 bg-green-600 text-white rounded"
                        >
                            Enable Sound
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setShowAudioPrompt(false);

                            try {
                                localStorage.setItem(
                                    "audioPromptDismissed",
                                    "true"
                                );
                            } catch {}
                        }}
                        className="absolute top-2 right-2"
                    >
                        ×
                    </button>
                </div>
            )}

            {toastMsg && (
                <div className="fixed bottom-4 right-4 bg-white border shadow rounded px-4 py-2 z-50">
                    {toastMsg}
                </div>
            )}

            <YourRestaurant
                reload={reload}
                restaurant={restaurant}
                onToggle={handleToggle}
            />
        </div>
    );
};

export default Restaurant;