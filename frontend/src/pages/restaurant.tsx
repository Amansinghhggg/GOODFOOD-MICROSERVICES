import { useEffect, useRef, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import CreateRestaurant from "../components/restaurant/createRestaurant";
import YourRestaurant from "../components/restaurant/YourRestaurant";
import { useSocket } from "../context/socketContext";
import restaurantNotifySound from "../Assets/50986408-what-meme-388653.mp3";
import toast from "react-hot-toast";
import { Bell, BellOff, X } from "lucide-react";

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

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function fetchRestaurant() {
    setLoading(true);
    try {
      const response = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
    audioRef.current
      .play()
      .then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setAudioUnlocked(true);
        try { localStorage.setItem("audioEnabled", "true"); } catch {}
        setShowAudioPrompt(false);
        toast.success("Order sound notifications enabled");
      })
      .catch(() => {});
  };

  const dismissAudioPrompt = () => {
    setShowAudioPrompt(false);
    try { localStorage.setItem("audioPromptDismissed", "true"); } catch {}
  };

  const handleToggle = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/restaurant/is-open`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchRestaurant();
    } catch (err) {
      console.error("Failed to toggle open state", err);
    }
  };

  useEffect(() => {
    if (!socket || !restaurant?._id) return;
    try {
      socket.emit("join_room", `restaurant:${restaurant._id}`, (res: any) => {
        console.log("join_room ack", res);
      });
    } catch (err) {
      console.error("Failed to emit join_room", err);
    }

    const newOrder = () => {
      toast.success("New order received! 🎉");
      setReload((prev) => !prev);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    socket.on("order_new", newOrder);
    return () => { socket.off("order_new", newOrder); };
  }, [socket, restaurant?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#E23774] border-t-transparent animate-spin" />
          <p className="text-sm text-white/40">Loading your restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <CreateRestaurant />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#E23774]/5 blur-[140px]" />
      </div>

      <div className="relative space-y-4 p-4 sm:p-6">
        {/* Sound notification banner */}
        {!audioUnlocked && showAudioPrompt && (
          <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Enable order notifications</p>
                <p className="mt-1 text-sm text-white/40">
                  Allow sound so you hear new orders the moment they arrive.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={unlockAudio}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                  >
                    <Bell size={13} />
                    Enable sound
                  </button>
                  <button
                    onClick={dismissAudioPrompt}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/40 transition hover:text-white/60"
                  >
                    <BellOff size={13} />
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={dismissAudioPrompt}
                className="shrink-0 text-white/20 transition hover:text-white/50"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <YourRestaurant
          reload={reload}
          restaurant={restaurant}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default Restaurant;
