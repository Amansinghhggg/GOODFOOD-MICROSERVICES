import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { restaurantService } from "../../main";
import { useAppContext } from "../../context/context";
import { useNavigate } from "react-router-dom";

const CreateRestaurant = () => {
    const { location } = useAppContext();
    const navigate = useNavigate();
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [latitude, setLatitude] = React.useState<number | "">(location?.latitude ?? "");
    const [longitude, setLongitude] = React.useState<number | "">(location?.longitude ?? "");
    const [formattedAddress, setFormattedAddress] = React.useState<string>(location?.formattedAddress ?? "");
    const [file, setFile] = React.useState<File | null>(null);
    const [phone, setPhone] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (location) {
            setLatitude(location.latitude);
            setLongitude(location.longitude);
            setFormattedAddress(location.formattedAddress);
        }
    }, [location]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        if (f) {
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        if (!name || !description || !latitude || !longitude || !formattedAddress || !phone || !file) {
            toast.error("All fields are required");
            setSubmitting(false);
            return;
        }
        if(phone.length!==10){
            toast.error(" enter a valid phone number");
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("latitude", String(latitude));
        formData.append("longitude", String(longitude));
        formData.append("formattedAddress", formattedAddress);
        formData.append("phone", phone);
        if (file) formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${restaurantService}/api/restaurant/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Restaurant created successfully");
            navigate("/", { replace: true });
            window.location.reload();
        
        } catch (error) {
            console.error("Error creating restaurant:", error);
            toast.error("Failed to create restaurant");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto my-10 rounded-xl bg-white p-8 border border-brand-border shadow-premium">
            <h2 className="text-3xl font-bold font-serif text-brand-charcoal mb-6">Create Restaurant</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                        placeholder="Restaurant name"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                        placeholder="Short description"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Latitude</label>
                        <input
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                            className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                            placeholder="Latitude"
                            type="number"
                            step="any"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Longitude</label>
                        <input
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                            className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                            placeholder="Longitude"
                            type="number"
                            step="any"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Formatted Address</label>
                    <input
                        value={formattedAddress}
                        onChange={(e) => setFormattedAddress(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                        placeholder="Address"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Phone</label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-brand-border bg-white py-2.5 px-3 text-sm text-brand-charcoal shadow-premium-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                        placeholder="Contact phone"
                        type="number"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 block w-full text-sm text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-cream file:text-brand-charcoal hover:file:bg-brand-cream-dark cursor-pointer" />
                    {previewUrl && (
                        <img src={previewUrl} alt="preview" className="mt-4 h-40 w-auto rounded-xl border border-brand-border object-cover shadow-premium-sm" />
                    )}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-brand-border/60">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-premium-sm hover:bg-brand-primary-hover hover:shadow-premium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Creating..." : "Create Restaurant"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRestaurant;
