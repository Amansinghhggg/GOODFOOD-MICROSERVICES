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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="flex items-center gap-3 text-sm text-rose-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading restaurant…
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#E23774] focus:ring-2 focus:ring-rose-100 placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">Edit Restaurant</h1>
            <p className="text-xs text-slate-400">Update your restaurant details</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-rose-100">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#E23774] via-[#f65d95] to-[#ff8a5c]" />

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">

            {/* Image upload */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Restaurant Photo
              </label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 transition hover:border-[#E23774] hover:bg-rose-50">
                {previewUrl ? (
                  <div className="relative w-full">
                    <img src={previewUrl} alt="preview" className="h-48 w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-rose-300 group-hover:text-[#E23774]">
                    <ImagePlus size={30} />
                    <span className="text-sm font-medium">Click to upload photo</span>
                    <span className="text-xs text-slate-400">PNG, JPG, WEBP accepted</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Restaurant Name
              </label>
              <div className="relative">
                <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-3 text-slate-400" />
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
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Latitude
                </label>
                <div className="relative">
                  <Navigation size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Longitude
                </label>
                <div className="relative">
                  <Navigation size={15} className="absolute left-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Formatted Address
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <div className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-slate-400">
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
            <div className="border-t border-slate-100" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E23774] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-[#c92e63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} />
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
