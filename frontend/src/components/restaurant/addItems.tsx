import  React from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../../main";

const AddItems = ({ gotoMenu }: { gotoMenu: () => void }) => {
     // Add item form state
  const [itemName, setItemName] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState<string>("");
  const [itemDesc, setItemDesc] = React.useState("");
  const [itemFile, setItemFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

 function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setItemFile(f);
  }
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if(!itemName || !itemPrice || !itemDesc || !itemFile){
        toast.error("Please fill all fields and select an image");
        setSubmitting(false);
        return;
    }
    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("price", itemPrice);
    formData.append("description", itemDesc);
    formData.append("file", itemFile);
      try{
        await axios.post(`${restaurantService}/api/menu/new`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
       toast.success("Menu item added successfully");
      } catch (err) {
        toast.error("Failed to add item");
        console.error(err);
      }finally {
      setSubmitting(false);
      }
    setItemName("");
    setItemPrice("");
    setItemDesc("");
    setItemFile(null);
    gotoMenu();
  }
  return (<div> <form onSubmit={handleAddItem} className="max-w-xl">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item name" className="rounded-md border border-gray-200 px-3 py-2" />
                  <input value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="Price" type="number" className="rounded-md border border-gray-200 px-3 py-2" />
                </div>
                <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Description" className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2" />
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-3" />
                <div className="mt-4">
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#E23774] px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Adding..." : "Add item"}</button>
                </div>
              </form></div>
)};

export default AddItems;
