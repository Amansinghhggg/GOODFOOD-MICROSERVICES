import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/context";
import { useSocket } from "../../context/socketContext";
import { riderService } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import riderNotifySound from "../../Assets/johnnybacon156-i-got-this-467997.mp3";
import IncomingOrderCart from "./iIncomingOrderCart";
import CurrentOrder from "./CurrentOrder";
import OrderMap from "./OrderMap";
import EarningsTab from "./EarningsTab";

interface IRider {
    _id: string;
    picture: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isVerified: boolean;
    isAvailable: boolean;
   
}
const Dashboard = () => {
    const {user,location,fetchLocation,city,loadingLocation} = useAppContext();
    const [earnTab,setEarnTab] = useState<any>(false);
    const {socket} = useSocket();
    const [profile,setProfile] = useState<IRider|null>(null);
    const[loading,setLoading] = useState<boolean>(true);
    const [togggling,setToggling] = useState<boolean>(false);
    const [picture, setPicture] = useState<File | null>(null);
    const navigate = useNavigate();
     const [incomingOrder, setIncomingOrder] = useState<any>([]);
     const [currentOrder, setCurrentOrder] = useState<any>(null);
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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        audioRef.current = new Audio(riderNotifySound);
        audioRef.current.preload = "auto";
        audioRef.current.preload = "auto";
        audioRef.current.volume = 1;
        audioRef.current.muted = false;
    }, []);
      const unlockAudio = async () => {
        if(currentOrder) return
        try {
          if (!audioRef.current) return;
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioUnlocked(true);
          toast.success("Sound Enabled");
        } catch (error) {
          toast.error("Tap again to enable sound");
        }
      };

    useEffect(()=>{
        if(!socket) return;
        console.log("Setting up socket listener for order availability...");
        const onOrderAvailable = ({orderId}: {orderId: string})=>{
          console.log("order available for rider ", orderId);
        setIncomingOrder((prev:any)=>prev.includes(orderId) ? prev : [...prev,orderId]);
          if(audioUnlocked &&audioRef.current){
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e)=>console.log("Error playing sound:",e));
        }
        setTimeout(() => {
          setIncomingOrder((prev:any)=>prev.filter((id:string)=>id!==orderId));
        }, 10000);
        };
        socket.on("order_ready_for_rider", onOrderAvailable);
        return ()=>{
            socket.off("order_ready_for_rider", onOrderAvailable);
        };
    }, [socket,audioUnlocked]);
    const fetchCurrentOrder = async()=>{
    try {

        const response = await axios.get(
            `${riderService}/api/rider/order/current`,
            {
                headers:{
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        setCurrentOrder(response.data.order);
        console.log("Current order fetched successfully:", response.data.order);
    } catch (error:any) {
        console.log("4. Error occurred");
        console.log(error);
        console.log(error?.response);
    }
};
    useEffect(()=>{
        if(profile){
            fetchCurrentOrder();
        }
    },[profile]);
    const [formData, setFormData] = useState({
      phoneNumber: "",
      aadharNumber: "",
      drivingLicenseNumber: "",
    });
    const [creating, setCreating] = useState<boolean>(false);


    const fetchProfile = async()=>{
        try {
            const response = await fetch(`${riderService}/api/rider/myprofile`,{
                headers:{
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            const data = await response.json();
            setProfile(data.account||null);
            setLoading(false);
        } catch (error) {
            setProfile(null);
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };
    useEffect(()=>{
        if(user?.role === "rider"){
        fetchProfile();
        }else{
            setLoading(false);
        }
    },[user]);

    const toggleAvailability = async()=>{
        setToggling(true)
        fetchLocation();
        try {
            const response = await axios.patch(`${riderService}/api/rider/toggle`,{
                latitude:location?.latitude,
                longitude:location?.longitude,
                isAvailable:!profile?.isAvailable
            },{
                headers:{
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            fetchProfile();
            toast.success(profile?.isAvailable ?"You are now Offline":"You are now Online and available for deliveries");
        } catch (error) {
            toast.error("Error toggling availability:");
            console.error("Error toggling availability:", error);
        }finally{
            setToggling(false);
        }

    };
      const handleLogout = () => {
        if(profile?.isAvailable){
            toast.error("Please go offline before logging out");
            return;
        }
  localStorage.removeItem("token");
  navigate("/login");
};
    if(loading){
        return <div className="animate-pulse text-sm font-medium text-gray-500">Loading rider details...</div>;
    }

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const data = new FormData();

    if (picture) {
      data.append("file", picture);
    }

    data.append("phoneNumber", formData.phoneNumber);
    data.append("aadharNumber", formData.aadharNumber);
    data.append("drivingLicenseNumber",formData.drivingLicenseNumber);
    data.append("latitude", String(location?.latitude));
    data.append("longitude", String(location?.longitude));

    try {

     await axios.post(`${riderService}/api/rider/create`, data, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
        toast.success("Rider profile created successfully");
        fetchProfile();
    } catch (error) {
      toast.error("Error creating rider profile");
      console.error("Error creating rider profile:", error);
    } finally {
      setCreating(false);
    }
}
    if(!profile){
         return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 backdrop-blur-sm"
      >
        <h2 className="mb-6 text-3xl font-bold text-white">
          Become a Rider
        </h2>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Profile Picture
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPicture(e.target.files?.[0] || null)
              }
              className="w-full rounded-xl border border-yellow-500/20 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="9876543210"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full rounded-xl border border-yellow-500/20 bg-black p-3 text-white outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Aadhaar Number
            </label>

            <input
              type="text"
              placeholder="XXXX XXXX XXXX"
              value={formData.aadharNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  aadharNumber: e.target.value,
                })
              }
              className="w-full rounded-xl border border-yellow-500/20 bg-black p-3 text-white outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Driving License Number
            </label>

            <input
              type="text"
              placeholder="MHXXXXXXXXXXXX"
              value={formData.drivingLicenseNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drivingLicenseNumber: e.target.value,
                })
              }
              className="w-full rounded-xl border border-yellow-500/20 bg-black p-3 text-white outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-500"
            disabled={creating}
          >
            {creating ? "Creating Profile..." : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
    }

    
    
    return <div>
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

        <div className="mx-auto max-w-3xl p-6">
  <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 backdrop-blur-sm">

    {/* Header */}
    <div className="flex flex-col items-center">
      <img
        src={profile.picture}
        alt="Rider"
        className="h-28 w-28 rounded-full border-2 border-pink-500 object-cover"
      />

      <h2 className="mt-4 text-2xl font-bold text-white">
        Rider Profile
      </h2>

      <p className="text-gray-400">
        {profile.phoneNumber}
      </p>
    </div>

    {/* Stats */}
    <div className="mt-8 grid gap-4 md:grid-cols-2">

      <div className="rounded-2xl border border-yellow-500/20 p-4">
        <p className="text-sm text-gray-400">
          Verification Status
        </p>

        <p
          className={`mt-2 font-semibold ${
            profile.isVerified
              ? "text-green-400"
              : "text-yellow-400"
          }`}
        >
          {profile.isVerified
            ? "Verified"
            : "Pending Verification"}
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 p-4">
        <p className="text-sm text-gray-400">
          Availability
        </p>

        <p
          className={`mt-2 font-semibold ${
            profile.isAvailable
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {profile.isAvailable
            ? "Online"
            : "Offline"}
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 p-4">
        <p className="text-sm text-gray-400">
          Current City
        </p>

        <p className="mt-2 font-semibold text-white">
          {city || "Unknown"}
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 p-4">
        <p className="text-sm text-gray-400">
          Last Active
        </p>

        <p className="mt-2 font-semibold text-white">
          {new Date().toLocaleDateString()}
        </p>
      </div>

    </div>

    {/* Actions */}
    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
      {profile.isVerified && !currentOrder && (
        <button
        onClick={() => {toggleAvailability()}}
        className={`flex-1 rounded-xl py-3 font-semibold text-white transition ${
          profile.isAvailable
            ? "bg-red-600 hover:bg-red-500"
            : "bg-green-600 hover:bg-green-500"
        }`}
      >
        {profile.isAvailable
          ? "Go Offline"
          : "Go Online"}
      </button>
      )}
      

      <button
        onClick={()=>{handleLogout()}}
        className="flex-1 rounded-xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-500"
      >
        Logout
      </button>
      <button
        onClick={()=>setEarnTab(true)}
        className="flex-1 rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-500"
      >
        Earnings
      </button>

    </div>
          {earnTab && <EarningsTab  closeTab={() => setEarnTab(false)} riderId={profile._id} />}

   {!currentOrder &&
  profile.isAvailable &&
  incomingOrder.length > 0 && (
    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
      <p className="text-sm text-yellow-400">New order available!</p>

      {incomingOrder.map((orderId: string) => (
        <IncomingOrderCart
          key={orderId}
          orderId={orderId}
          onAccepted={() => {
            fetchProfile();
            fetchCurrentOrder();
          }}
        />
      ))}
    </div>
)}
   
    {currentOrder && (
        <div className="mx-auto max-w-md px-4 space-y-4">
          <CurrentOrder order={currentOrder} 
            onstatusUpdate={fetchCurrentOrder}
          />
          <OrderMap order={currentOrder} />
          </div>

      )}
  </div>
</div>
    </div>;
    };

export default Dashboard;
