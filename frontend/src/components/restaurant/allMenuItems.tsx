import axios from "axios";
import React, { useEffect } from "react";
import { restaurantService } from "../../main";
import toast from "react-hot-toast";
import { Edit2, Trash2, ToggleLeft, ToggleRight, X, ShoppingCart } from "lucide-react";
import { useAppContext } from "../../context/context";

const AllMenuItems = ({ restaurantId, restaurantOwner, isOpen: _isOpen }: { restaurantId: string; restaurantOwner: string; isOpen: boolean }) => {
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


  return (
    <div>
      <div className="space-y-4">
        {menuItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-cream/35 p-8 text-center shadow-premium-sm">
            <p className="font-serif text-sm font-bold text-brand-charcoal">No menu items yet</p>
            <p className="mt-1 text-xs text-brand-muted">Use the Add Item tab to create dishes.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {menuItems.map((it) => (
              <div
                key={it._id}
                className={`flex items-center gap-4 rounded-2xl border p-4 shadow-premium-sm transition-colors duration-200 ${
                  it.isAvailable
                    ? "border-brand-border/60 bg-brand-card"
                    : "border-brand-border bg-brand-cream-dark/35 opacity-70"
                }`}
              >
                <div
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-border/40 ${
                    it.isAvailable ? "bg-brand-cream-dark/40" : "bg-brand-cream-dark/80"
                  }`}
                >
                  {it.image ? <img src={it.image} className={`h-full w-full object-cover ${it.isAvailable ? "" : "grayscale"}`} /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className={`font-serif text-sm font-bold truncate ${it.isAvailable ? "text-brand-charcoal" : "text-brand-muted"}`}>
                        {it.name}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-xs text-brand-muted leading-relaxed">{it.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold text-xs ${it.isAvailable ? "text-brand-primary" : "text-brand-muted"}`}>
                        ₹{it.price}
                      </div>
                      <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${it.isAvailable ? "bg-brand-secondary/15 text-brand-secondary" : "bg-brand-cream-dark text-brand-muted"}`}>
                        {it.isAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(it)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-bold text-brand-charcoal hover:bg-brand-cream-dark/30 hover:border-brand-primary/30 transition duration-150"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailability(it._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-bold text-brand-charcoal hover:bg-brand-cream-dark/30 transition duration-150"
                      >
                        {it.isAvailable ? <ToggleLeft size={13} className="text-brand-muted" /> : <ToggleRight size={13} className="text-brand-primary" />}
                        {it.isAvailable ? "Set Unavailable" : "Set Available"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(it._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-bold text-brand-error hover:bg-brand-error/5 hover:border-brand-error/30 transition duration-150"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => addtocart(it._id)}
                        className="flex items-center justify-center p-2 rounded-full border border-brand-border bg-brand-card text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/30 transition duration-150"
                        aria-label={`Add ${it.name} to cart`}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingItem ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-brand-card p-6 shadow-premium-lg border border-brand-border/60">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-base font-bold text-brand-charcoal">Edit menu item</h3>
                          <p className="text-xs text-brand-muted">Update the item details and save changes.</p>
                        </div>
                        <button
                          type="button"
                          onClick={closeEdit}
                          className="rounded-xl p-1.5 text-brand-muted hover:bg-brand-cream-dark/40"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <form onSubmit={saveEdit} className="mt-5 space-y-3">
                        <div>
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Item name"
                            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-xs text-brand-charcoal outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                          />
                        </div>
                        <div>
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="Price"
                            type="number"
                            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-xs text-brand-charcoal outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                          />
                        </div>
                        <div>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            rows={3}
                            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-xs text-brand-charcoal outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition resize-none"
                          />
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                            className="w-full text-xs text-brand-muted file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="rounded-xl border border-brand-border bg-brand-card px-4 py-2 text-xs font-bold text-brand-muted hover:bg-brand-cream-dark/30 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingEdit}
                            className="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-premium hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70 transition"
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
    </div>
  );
};

export default AllMenuItems;
