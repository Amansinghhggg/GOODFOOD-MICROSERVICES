import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";
import { MapPin, Phone, Home } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const LocationPicker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { setLocation(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const LocateMeButton = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };
  return (
    <button
      onClick={locateUser}
      className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-xl border border-white bg-[#2C2923] px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg transition hover:bg-rose-50 hover:text-[#E23774]"
    >
      <LuLocateFixed size={14} /> Use my location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [inputAddress, setInputAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch { toast.error("Failed to fetch address"); }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat); setLongitude(lng); fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
    } catch { toast.error("Failed to load addresses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) {
      toast.error("Please select location on map");
      return;
    }
    try {
      setAdding(true);
      await axios.post(`${restaurantService}/api/address/new`, {
        formattedAddress: inputAddress + " , " + formattedAddress,
        mobile, latitude, longitude,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address added");
      setMobile(""); setFormattedAddress(""); setInputAddress(""); setLatitude(null); setLongitude(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally { setAdding(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch { toast.error("Failed to delete address"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-[#22201B] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-black text-[#EFEBE3]">Delivery Address</h1>
          <p className="text-xs text-[#A39B8F]">Pin your location on the map to add a new address</p>
        </div>

        {/* Map card */}
        <div className="overflow-hidden rounded-3xl bg-[#2C2923] shadow-premium border border-[#3A352F]/60">
          <div className="p-5 space-y-4">

            {/* Map */}
            <div className="relative h-64 overflow-hidden rounded-2xl border border-[#3A352F] shadow-inner">
              <MapContainer
                center={[latitude || 19.076, longitude || 72.8777]}
                zoom={13}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <LocationPicker setLocation={setLocation} />
                <LocateMeButton onLocate={setLocation} />
                {latitude && longitude && <Marker position={[latitude, longitude]} />}
              </MapContainer>
            </div>

            <p className="text-xs text-brand-primary font-semibold">
              📍 Tap "Use my location" or click anywhere on the map to set your delivery point
            </p>

            {/* Selected address preview */}
            {formattedAddress && (
              <div className="flex items-start gap-2 rounded-2xl border border-brand-secondary/30 bg-brand-secondary/5 px-4 py-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-secondary" />
                <p className="text-xs font-semibold text-brand-secondary">{formattedAddress}</p>
              </div>
            )}

            {/* House/flat input */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Flat / Building / Area
              </label>
              <div className="relative">
                <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                <input
                  type="text"
                  placeholder="Room No, Building, Landmark…"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-9 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                <input
                  type="number"
                  placeholder="10-digit mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-9 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              disabled={adding}
              onClick={addAddress}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-xs font-bold text-white shadow-premium transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? <BiLoader className="animate-spin" size={16} /> : <BiPlus size={16} />}
              {adding ? "Saving…" : "Save Address"}
            </button>
          </div>
        </div>

        {/* Saved addresses */}
        <div className="rounded-3xl bg-[#2C2923] p-5 shadow-premium border border-[#3A352F]/60">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
              <Home size={15} />
            </div>
            <h2 className="font-serif text-sm font-bold text-[#EFEBE3]">Saved Addresses</h2>
            {addresses.length > 0 && (
              <span className="ml-auto rounded-full bg-brand-secondary/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-secondary">{addresses.length}</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#A39B8F]">
              <BiLoader className="animate-spin" /> Loading…
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#3A352F]/65 py-8 bg-[#22201B]/35">
              <MapPin size={28} className="mb-2 text-[#A39B8F]/40" />
              <p className="text-xs font-medium text-[#A39B8F]">No addresses saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr._id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#3A352F]/50 bg-[#22201B]/30 px-4 py-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-brand-primary" />
                    <div>
                      <p className="text-xs font-semibold text-[#EFEBE3] leading-relaxed">{addr.formattedAddress}</p>
                      <p className="mt-0.5 text-[10px] text-[#A39B8F] font-medium">📞 {addr.mobile}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    disabled={deletingId === addr._id}
                    className="shrink-0 rounded-xl p-2 text-brand-error/65 transition hover:bg-brand-error/5 disabled:opacity-50"
                  >
                    {deletingId === addr._id
                      ? <BiLoader size={15} className="animate-spin" />
                      : <BiTrash size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAddressPage;
