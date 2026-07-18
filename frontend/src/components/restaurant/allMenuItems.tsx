import axios from "axios";
import React, { useEffect } from "react";
import { restaurantService } from "../../main";
import toast from "react-hot-toast";
import { Edit2, Trash2, ToggleLeft, ToggleRight, X, Plus, ShoppingCart } from "lucide-react";
import { useAppContext } from "../../context/context";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

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
          <div className="rounded-2xl border border-dashed border-[#3A352F] bg-[#22201B]/35 p-8 text-center shadow-premium-sm">
            <p className="font-serif text-sm font-bold text-[#EFEBE3]">No menu items yet</p>
            <p className="mt-1 text-xs text-[#A39B8F]">Use the Add Item tab to create dishes.</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/50">
            {menuItems.map((it) => (
              <div
                key={it._id}
                className={`group flex gap-5 py-6 first:pt-0 last:pb-0 transition-opacity duration-200 ${
                  it.isAvailable ? "" : "opacity-55"
                }`}
              >
                {/* ── Left: Item Info ── */}
                <div className="flex-1 min-w-0">
                  {/* Availability badge */}
                  <div className="mb-2">
                    {it.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#3A352F] bg-[#22201B]-dark px-2 py-0.5 text-[10px] font-bold text-[#A39B8F]">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-muted/50" />
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className={`font-serif text-base font-bold leading-snug ${it.isAvailable ? "text-[#EFEBE3]" : "text-[#A39B8F]"}`}>
                    {it.name}
                  </h4>

                  {/* Price */}
                  <p className={`mt-1 text-sm font-bold ${it.isAvailable ? "text-[#EFEBE3]" : "text-[#A39B8F]"}`}>
                    {formatCurrency(it.price)}
                  </p>

                  {/* Description */}
                  {it.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#A39B8F] font-medium">
                      {it.description}
                    </p>
                  )}

                  {/* Owner action buttons */}
                  {isOwner && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(it)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A352F] bg-[#2C2923] px-3 py-1.5 text-xs font-bold text-[#EFEBE3] hover:bg-[#22201B]-dark/30 hover:border-brand-primary/30 transition duration-150"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailability(it._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A352F] bg-[#2C2923] px-3 py-1.5 text-xs font-bold text-[#EFEBE3] hover:bg-[#22201B]-dark/30 transition duration-150"
                      >
                        {it.isAvailable ? <ToggleLeft size={13} className="text-[#A39B8F]" /> : <ToggleRight size={13} className="text-brand-primary" />}
                        {it.isAvailable ? "Set Unavailable" : "Set Available"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(it._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A352F] bg-[#2C2923] px-3 py-1.5 text-xs font-bold text-brand-error hover:bg-brand-error/5 hover:border-brand-error/30 transition duration-150"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Right: Image + Add Button ── */}
                <div className="relative shrink-0 self-start">
                  <div
                    className={`h-28 w-28 overflow-hidden rounded-2xl border border-[#3A352F]/60 shadow-premium-sm sm:h-32 sm:w-32 ${
                      it.isAvailable ? "bg-[#22201B]-dark/40" : "bg-[#22201B]-dark/80"
                    }`}
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${it.isAvailable ? "" : "grayscale"}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#A39B8F]/30">
                        <ShoppingCart size={24} />
                      </div>
                    )}
                  </div>

                  {/* Add to cart button — customer view only */}
                  {!isOwner && it.isAvailable && (
                    <button
                      type="button"
                      onClick={() => addtocart(it._id)}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/30 bg-[#2C2923] px-5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-brand-primary shadow-premium-sm transition hover:bg-brand-primary hover:text-white hover:shadow-premium hover:-translate-y-0.5 active:scale-95"
                    >
                      <Plus size={14} strokeWidth={3} />
                      Add
                    </button>
                  )}
                  {!isOwner && !it.isAvailable && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-lg border border-[#3A352F] bg-[#22201B]-dark px-5 py-1.5 text-xs font-bold text-[#A39B8F] shadow-premium-sm cursor-not-allowed">
                      Unavailable
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Modal (unchanged logic) ── */}
      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#2C2923] p-6 shadow-premium-lg border border-[#3A352F]/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#EFEBE3]">Edit menu item</h3>
                <p className="text-xs text-[#A39B8F]">Update the item details and save changes.</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl p-1.5 text-[#A39B8F] hover:bg-[#22201B]-dark/40"
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
                  className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] px-3 py-2.5 text-xs text-[#EFEBE3] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                />
              </div>
              <div>
                <input
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Price"
                  type="number"
                  className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] px-3 py-2.5 text-xs text-[#EFEBE3] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                />
              </div>
              <div>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full rounded-xl border border-[#3A352F] bg-[#2C2923] px-3 py-2.5 text-xs text-[#EFEBE3] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition resize-none"
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-[#A39B8F] file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-[#3A352F] bg-[#2C2923] px-4 py-2 text-xs font-bold text-[#A39B8F] hover:bg-[#22201B]-dark/30 transition"
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
  );
};

export default AllMenuItems;
