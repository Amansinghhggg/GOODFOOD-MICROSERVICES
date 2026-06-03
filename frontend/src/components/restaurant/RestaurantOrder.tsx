import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/socketContext";
import restaurantNotify from "../../Assets/6-_-7-watch-yo-jet-bro-446063.mp3"
import { restaurantService } from "../../main";
import axios from "axios";
const ACTIVE_STATUS = ["placed", "accepted", "preparing", "ready_for_rider","picked_up"];
const RestaurantOrder = ({restaurantId}: {restaurantId: string}) => {
    const[order,setOrders] = useState([])
    const[loading,setLoading] = useState(false);
    const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => {
        try { return localStorage.getItem('audioEnabled') === 'true'; } catch { return false; }
    });
    const [showAudioPrompt, setShowAudioPrompt] = useState<boolean>(() => {
        try { return localStorage.getItem('audioPromptDismissed') !== 'true'; } catch { return true; }
    });
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const {socket} = useSocket();
    const audioRef = useRef<HTMLAudioElement|null>(null);
        useEffect(() => {
            audioRef.current = new Audio(restaurantNotify);
            audioRef.current.preload = "auto";
            audioRef.current.load();
            audioRef.current.muted = false;
            audioRef.current.volume = 1;
        }, []);

    const unlockAudio = () => {
        if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.volume = 1;
            audioRef.current.play().then(() => {
                audioRef.current!.pause();
                audioRef.current!.currentTime = 0;
                setAudioUnlocked(true);
                try { localStorage.setItem('audioEnabled', 'true'); } catch {}
                setShowAudioPrompt(false);
            }).catch(() => {
                // ignore; unlocking isn't critical if user can still hear fallback
            });
        }
    };

    const playTestTone = () => {
        try {
            const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880;
            g.gain.value = 0.15;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            setTimeout(() => {
                o.stop();
                try { ctx.close(); } catch(_){ }
            }, 200);
        } catch (_err) {
            // ignore
        }
    }
    
    const fetchOrders = async() => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${restaurantService}/api/order/${restaurantId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, [restaurantId]);

    useEffect(() => {
        if(!socket) return;
        // ensure this client joins its restaurant room so it receives restaurant-scoped events
        try {
            socket.emit('join_room', `restaurant:${restaurantId}`, (res: any) => {
                console.log('join_room ack', res);
            });
        } catch (err) {
            console.error('Failed to emit join_room', err);
        }

        const newOrder = ()=>{
            // play fallback beep first so user hears immediately
            playTestTone();
            // show a small visual toast so owner never misses an order
            setToastMsg('New order received');
            setTimeout(() => setToastMsg(null), 3000);
            if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.volume = 1;
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {
                    // if mp3 fails, fallback beep already played
                });
            }
            fetchOrders();
        }
        socket.on("order_new", newOrder);
        // cleanup
        return () => {
            try { socket.off('order_new', newOrder); } catch(_){}
        };
    }, [socket, audioUnlocked]);
    

    if(loading){
        return <div className="h-16 flex items-center justify-center bg-gray-200">Loading Orders...</div>;
    }
    const activeOrders = order.filter((o: any) => ACTIVE_STATUS.includes(o.status));
    const completedOrders = order.filter((o: any) => !ACTIVE_STATUS.includes(o.status));


    return <div className="space-y-6">
        {!audioUnlocked && showAudioPrompt && (
            <div className="relative flex items-start gap-4 p-4 rounded-md bg-white shadow-md border border-gray-200">
                <div className="flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M10 2a1 1 0 00-1 1v.07A6 6 0 004 9v3l-1 1v1h14v-1l-1-1V9a6 6 0 00-5-5.93V3a1 1 0 00-1-1z" />
                        <path d="M9 18a2 2 0 004 0H9z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Enable notifications for new orders
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Allow sound so you'll immediately hear new incoming orders.
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex gap-2">
                            <button onClick={unlockAudio} className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-medium rounded-md shadow hover:opacity-95 transition">
                                Enable sound
                            </button>
                            <button onClick={playTestTone} className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm rounded-md hover:bg-gray-50">
                                Test sound
                            </button>
                        </div>
                    </div>
                </div>
                <button aria-label="Dismiss" onClick={() => { setShowAudioPrompt(false); try { localStorage.setItem('audioPromptDismissed','true'); } catch{} }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Dismiss</span>
                    ×
                </button>
            </div>
        )}

        {/* transient visual toast for new orders */}
        {toastMsg && (
            <div className="fixed right-4 bottom-4 bg-white border border-gray-200 shadow-md rounded-md px-4 py-2 z-50">
                <div className="text-sm font-medium text-gray-900">{toastMsg}</div>
            </div>
        )}

    </div>;
};



export default RestaurantOrder;
