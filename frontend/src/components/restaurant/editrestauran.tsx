import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { restaurantService } from "../../main";
import { ImagePlus, Store, FileText, MapPin, Navigation, Phone, ArrowLeft, Save } from "lucide-react";

const EditRestaurant = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [latitude, setLatitude] = React.useState<number | "">("");
  const [longitude, setLongitude] = React.useState<number | "">("");
  const [formattedAddress, setFormattedAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchRestaurant() {
      try {
        const resp = await axios.get(`${restaurantService}/api/restaurant/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const restaurant = resp.data.restaurant;
        if (!restaurant) {
          toast.error("No restaurant found");
          navigate("/", { replace: true });
          return;
        }
        if (!mounted) return;
        setName(restaurant.name || "");
        setDescription(restaurant.description || "");
        setPhone(String(restaurant.phone ?? ""));
        setFormattedAddress(restaurant.autoLocation?.formattedAddress || "");
        setLatitude(restaurant.autoLocation?.coordinates?.[1] ?? "");
        setLongitude(restaurant.autoLocation?.coordinates?.[0] ?? "");
        setPreviewUrl(restaurant.image || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load restaurant");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRestaurant();
    return () => { mounted = false; };
  }, [navigate]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const normalizedPhone = phone.replace(/\D/g, "");

    if (!name || !description || !latitude || !longitude || !formattedAddress || !normalizedPhone) {
      toast.error("All fields are required");
      setSubmitting(false);
      return;
    }
    if (normalizedPhone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(latitude));
    formData.append("longitude", String(longitude));
    formData.append("formattedAddress", formattedAddress);
    formData.append("phone", normalizedPhone);
    if (file) formData.append("file", file);

    try {
      await axios.post(`${restaurantService}/api/restaurant/edit`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Restaurant updated successfully");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update restaurant");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#22201B]">
        <div className="flex items-center gap-3 text-xs text-[#A39B8F]">
          <svg className="h-5 w-5 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading restaurant details…
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-10 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-[#A39B8F]/40";

  return (
    <div className="min-h-screen bg-[#22201B] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3A352F] bg-[#2C2923] text-[#A39B8F] shadow-premium-sm transition hover:bg-[#22201B]-dark/30 hover:text-[#EFEBE3]"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#EFEBE3]">Edit Restaurant</h1>
            <p className="text-xs text-[#A39B8F]">Update your restaurant details</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#2C2923] shadow-premium border border-[#3A352F]/60">
          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">

            {/* Image upload */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Restaurant Photo
              </label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#3A352F] bg-[#22201B]/35 transition hover:border-brand-primary hover:bg-[#22201B]/60">
                {previewUrl ? (
                  <div className="relative w-full">
                    <img src={previewUrl} alt="preview" className="h-48 w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal/40 opacity-0 transition group-hover:opacity-100 backdrop-blur-[2px]">
                      <span className="rounded-xl bg-[#2C2923] px-3 py-1.5 text-xs font-bold text-[#EFEBE3] shadow-premium">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-[#A39B8F]/40 group-hover:text-brand-primary/60">
                    <ImagePlus size={30} />
                    <span className="text-xs font-bold text-[#A39B8F]">Click to upload photo</span>
                    <span className="text-[10px] text-[#A39B8F]/75">PNG, JPG, WEBP accepted</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Restaurant Name
              </label>
              <div className="relative">
                <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spice Garden"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Description
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-[#A39B8F]" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your restaurant…"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Lat / Lng */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                  Latitude
                </label>
                <div className="relative">
                  <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                  <input
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="28.6139"
                    type="number"
                    step="any"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                  Longitude
                </label>
                <div className="relative">
                  <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A39B8F]" />
                  <input
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="77.2090"
                    type="number"
                    step="any"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Formatted Address
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                <input
                  value={formattedAddress}
                  onChange={(e) => setFormattedAddress(e.target.value)}
                  placeholder="Full address with city & pincode"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
                <div className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-[#A39B8F]">
                  +91
                </div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  type="tel"
                  className={`${inputClass} pl-16`}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#3A352F]/60" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-[#3A352F] bg-[#2C2923] px-5 py-2.5 text-xs font-bold text-[#A39B8F] hover:bg-[#22201B]-dark/30 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 transition"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
