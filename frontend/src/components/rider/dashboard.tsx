import { useEffect, useState } from "react";
import { useAppContext } from "../../context/context";
import { useSocket } from "../../context/socketContext";
import { riderService } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    const {socket} = useSocket();
    const [profile,setProfile] = useState<IRider|null>(null);
    const[loading,setLoading] = useState<boolean>(true);
    const [togggling,setToggling] = useState<boolean>(false);
    const [picture, setPicture] = useState<File | null>(null);
    const navigate = useNavigate();
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
            toast.success(profile?.isAvailable ? "You are now available for deliveries" : "You are now Offline ");
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

      <button
        onClick={()=>{handleLogout()}}
        className="flex-1 rounded-xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-500"
      >
        Logout
      </button>

    </div>
  </div>
</div>
    </div>;
    };

export default Dashboard;
