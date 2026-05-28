import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { restaurantService } from "../../main";

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
    return () => { mounted = false };
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

  if (loading) return <div className="h-24 flex items-center justify-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl my-10 rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Restaurant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Restaurant name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Short description" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input value={latitude} onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Latitude" type="number" step="any" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input value={longitude} onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Longitude" type="number" step="any" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Formatted address</label>
          <input value={formattedAddress} onChange={(e) => setFormattedAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Address" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#E23774] focus:border-[#E23774]" placeholder="Contact phone" type="tel" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          {previewUrl && (
            <img src={previewUrl} alt="preview" className="mt-2 h-40 w-auto rounded" />
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#E23774] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#c72d65] disabled:opacity-60">
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant;
