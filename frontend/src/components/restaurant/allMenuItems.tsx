import axios from "axios";
import React, { useEffect } from "react";
import { restaurantService } from "../../main";
import toast from "react-hot-toast";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const AllMenuItems = ({ restaurantId }: { restaurantId: string }) => {
    const [menuItems, setMenuItems] = React.useState<any[]>([]);

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

    useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

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
                          <div className="mt-3 flex flex-wrap gap-2">
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
                        </div>
                      </div>
                      
                    ))}
                  </div>
                )}
              </div>
            </div>)
};

export default AllMenuItems;
