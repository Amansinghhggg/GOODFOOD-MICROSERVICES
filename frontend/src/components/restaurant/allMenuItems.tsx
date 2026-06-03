import axios from "axios";
import React, { useEffect } from "react";
import { restaurantService } from "../../main";
import toast from "react-hot-toast";
import { Edit2, Trash2, ToggleLeft, ToggleRight, X, Divide, ShoppingCart } from "lucide-react";
import { useAppContext } from "../../context/context";

const AllMenuItems = ({ restaurantId, restaurantOwner, isOpen }: { restaurantId: string; restaurantOwner: string; isOpen: boolean }) => {
    const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPrice, setEditPrice] = React.useState<string>("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editFile, setEditFile] = React.useState<File | null>(null);
  const [savingEdit, setSavingEdit] = React.useState(false);
  const { user,fetchCart } = useAppContext();
  const isOwner = user?._id === restaurantOwner;
    async function fetchMenuItems() {
        try {
            const {data} = await axios.get(`${restaurantService}/api/menu/all/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setMenuItems(data.menuItems);
        } catch (err) {
            console.error("Failed to fetch menu items", err);
            toast.error("Failed to load menu items");
        }
    }

  async function toggleAvailability(itemId: string) {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/menu/available/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, isAvailable: data?.menuItem?.isAvailable ?? !item.isAvailable }
            : item
        )
      );
      toast.success("Item availability updated");
    } catch (err) {
      console.error("Failed to update availability", err);
      toast.error("Failed to update availability");
    }
  }

  async function deleteItem(itemId: string) {
    const confirmed = window.confirm("Delete this menu item?");
    if (!confirmed) return;

    try {
      await axios.delete(`${restaurantService}/api/menu/delete/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMenuItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item deleted");
    } catch (err) {
      console.error("Failed to delete item", err);
      toast.error("Failed to delete item");
    }
  }

  function startEdit(item: any) {
    setEditingItem(item);
    setEditName(item.name || "");
    setEditPrice(String(item.price ?? ""));
    setEditDesc(item.description || "");
    setEditFile(null);
  }

  function closeEdit() {
    setEditingItem(null);
    setEditName("");
    setEditPrice("");
    setEditDesc("");
    setEditFile(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    formData.append("description", editDesc);
    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      const { data } = await axios.put(
        `${restaurantService}/api/menu/edit/${editingItem._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? data?.menuItem ?? item : item))
      );
      toast.success("Item updated");
      closeEdit();
    } catch (err) {
      console.error("Failed to update item", err);
      toast.error("Failed to update item");
    } finally {
      setSavingEdit(false);
    }
  }

    useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  async function addtocart(itemId: string) {
       try {
      await axios.post(`${restaurantService}/api/cart/add`, { itemsId: itemId,
    restaurantId}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Item added to cart");
      await fetchCart();
    } catch (error: any) {
      console.error("Failed to add item to cart", error);
      toast.error(`${error.response?.data?.message || "Failed to add item to cart"}`);
    }
  }


  return( <div>
              <div className="space-y-4">
                {menuItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-orange-100 bg-orange-50/40 p-6 text-center">
                    <p className="font-medium text-slate-800">No menu items yet</p>
                    <p className="mt-1 text-sm text-slate-500">Use the Add Item tab to create dishes.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {menuItems.map((it) => (
                      <div
                        key={it._id}
                        className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-colors ${
                          it.isAvailable
                            ? "border-emerald-100 bg-emerald-50/40"
                            : "border-slate-200 bg-slate-50 opacity-75"
                        }`}
                      >
                        <div
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ${
                            it.isAvailable ? "bg-emerald-100" : "bg-slate-200"
                          }`}
                        >
                          {it.image ? <img src={it.image} className={`h-full w-full object-cover ${it.isAvailable ? "" : "grayscale"}`} /> : null}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className={`font-medium ${it.isAvailable ? "text-slate-900" : "text-slate-500"}`}>
                                {it.name}
                              </h4>
                              <p className="mt-1 text-sm text-slate-500">{it.description}</p>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${it.isAvailable ? "text-emerald-700" : "text-slate-500"}`}>
                                ₹{it.price}
                              </div>
                              <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${it.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                {it.isAvailable ? "Available" : "Unavailable"}
                              </div>
                            </div>
                          </div>
                            {isOwner?(
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(it)}
                              className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAvailability(it._id)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {it.isAvailable ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                              {it.isAvailable ? "Mark unavailable" : "Mark available"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(it._id)}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                            ):(<button
                              type="button"
                              onClick={() => addtocart(it._id)}
                              className="flex h-full w-full items-center justify-center text-red-400"
                              aria-label={`Add ${it.name} to cart`}
                            >
                              <ShoppingCart size={20} />
                            </button>)}
                        </div>

                  {editingItem ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Edit menu item</h3>
                            <p className="text-sm text-slate-500">Update the item details and save changes.</p>
                          </div>
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={saveEdit} className="mt-5 space-y-3">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Item name"
                            className="w-full rounded-md border border-gray-200 px-3 py-2"
                          />
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="Price"
                            type="number"
                            className="w-full rounded-md border border-gray-200 px-3 py-2"
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full rounded-md border border-gray-200 px-3 py-2"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                            className="w-full"
                          />
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={closeEdit}
                              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingEdit}
                              className="rounded-full bg-[#E23774] px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {savingEdit ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : null}
                      </div>
                      
                    ))}
                  </div>
                )}
              </div>
            </div>)
};

export default AllMenuItems;
