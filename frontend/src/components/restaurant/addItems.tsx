import React from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../../main";
import { ImagePlus, Tag, FileText, IndianRupee } from "lucide-react";

const AddItems = ({ gotoMenu }: { gotoMenu: () => void }) => {
  const [itemName,  setItemName]  = React.useState("");
  const [itemPrice, setItemPrice] = React.useState<string>("");
  const [itemDesc,  setItemDesc]  = React.useState("");
  const [itemFile,  setItemFile]  = React.useState<File | null>(null);
  const [preview,   setPreview]   = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setItemFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else   setPreview(null);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (!itemName || !itemPrice || !itemDesc || !itemFile) {
      toast.error("Please fill all fields and select an image");
      setSubmitting(false);
      return;
    }
    const formData = new FormData();
    formData.append("name",        itemName);
    formData.append("price",       itemPrice);
    formData.append("description", itemDesc);
    formData.append("file",        itemFile);
    try {
      await axios.post(`${restaurantService}/api/menu/new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Menu item added successfully");
    } catch (err) {
      toast.error("Failed to add item");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
    setItemName("");
    setItemPrice("");
    setItemDesc("");
    setItemFile(null);
    setPreview(null);
    gotoMenu();
  }

  return (
    <div className="mx-auto max-w-2xl bg-[#2C2923]">
      <div className="mb-6">
        <h2 className="font-serif text-lg font-bold text-[#EFEBE3]">Add Menu Item</h2>
        <p className="text-xs text-[#A39B8F]">Fill in the details to add a new dish to your menu</p>
      </div>

      <form onSubmit={handleAddItem} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
            Item Photo
          </label>
          <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#3A352F] bg-[#22201B]/35 transition hover:border-brand-primary hover:bg-[#22201B]/60">
            {preview ? (
              <img src={preview} alt="preview" className="h-48 w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-[#A39B8F]/40 group-hover:text-brand-primary/60">
                <ImagePlus size={32} />
                <span className="text-xs font-bold text-[#A39B8F]">Click to upload image</span>
                <span className="text-[10px] text-[#A39B8F]/75">PNG, JPG, WEBP accepted</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
        </div>

        {/* Name + Price row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
              Item Name
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Paneer Tikka"
                className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-9 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">
              Price (₹)
            </label>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39B8F]" />
              <input
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="e.g. 249"
                type="number"
                className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-9 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>
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
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Describe the dish — ingredients, taste, special notes…"
              rows={3}
              className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] py-2.5 pl-9 pr-3 text-xs text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-premium transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Adding…
              </>
            ) : "Add to Menu"}
          </button>
          <button
            type="button"
            onClick={gotoMenu}
            className="rounded-xl border border-[#3A352F] bg-[#2C2923] px-5 py-2.5 text-xs font-bold text-[#A39B8F] hover:bg-[#22201B]-dark/30 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItems;
