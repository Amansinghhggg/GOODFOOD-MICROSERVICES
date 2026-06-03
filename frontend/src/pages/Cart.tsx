import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import type { IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import AddItems from "../components/restaurant/addItems";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);


const Cart = () => {
  const { cart, subtotal, quantity,fetchCart } = useAppContext();
  const cartItems = Array.isArray(cart) ? cart : [];
  const deliveryFee = subtotal >250 ?  0: 49;
  const platformServiceFee = 7;

  async function removeItem(itemsId?: string, restaurantId?: string) {
    console.log("Removing item from cart:", { itemsId, restaurantId });
    try {
        await axios.put(`${restaurantService}/api/cart/remove`,{restaurantId,itemsId}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            
        });
        fetchCart();

    } catch (error) {
        console.error("Error removing item from cart:", error);
    }
  }
  async function addItems(itemsId?: string, restaurantId?: string) {
    console.log("Adding item to cart:", { itemsId, restaurantId });
    try {
        await axios.post(`${restaurantService}/api/cart/add`,{restaurantId,itemsId}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            
        });
        fetchCart();

    } catch (error) {
        console.error("Error adding item to cart:", error);
    }
  }

  async function clearCart() {
    try {
        axios.delete(`${restaurantService}/api/cart/clear`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            });
        fetchCart();
     } catch (error) {
        console.error("Error clearing cart:", error);
    }
    }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,rgba(226,55,116,0.10),transparent_32%),linear-gradient(180deg,#fffaf7_0%,#fff7ef_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-4xl border border-orange-100 bg-white shadow-[0_20px_70px_rgba(226,55,116,0.10)]">
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-orange-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cart items</p>
                  <p className="mt-1 text-sm text-slate-500">Remove All Items in Cart</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50"
                    onClick={clearCart}
                >
                  <Trash2 size={16} />
                  Clear cart
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-white px-6 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E23774]/10 text-[#E23774]">
                    <ShoppingBag size={28} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-slate-900">Your cart is empty</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Add a few menu items and they will appear here with quantity controls and pricing.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E23774] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
                  >
                    Browse menu
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((cartItem) => {
                    const menuItem = cartItem.itemsId as IMenuItem | undefined;
                    const restaurant = cartItem.restaurantId as IRestaurant | undefined;
                    const itemQuantity = cartItem.quantity;
                    const price = menuItem?.price ?? 0;
                    const itemTotal = price * itemQuantity;

                    return (
                      <article
                        key={cartItem._id}
                        className="group overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(226,55,116,0.08)]"
                      >
                        <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center">
                          <div className="flex items-start gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-orange-100 bg-orange-50">
                              {menuItem?.image ? (
                                <img src={menuItem.image} alt={menuItem.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#E23774]/10 to-orange-100 text-[#E23774]">
                                  <ShoppingBag size={22} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-bold text-slate-900">{menuItem?.name ?? "Menu item"}</h3>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  {restaurant?.name ?? "Restaurant"}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                {menuItem?.description ?? "No description available for this item."}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="font-semibold text-slate-900">{formatCurrency(price)}</span>
                                <span>Item quantity: {itemQuantity}</span>
                                <span>Line total: {formatCurrency(itemTotal)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 lg:ml-auto lg:items-end">
                            <div className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50/60 p-1 shadow-sm">
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-50 hover:text-[#E23774]"
                                aria-label={`Decrease quantity for ${menuItem?.name ?? "item"}`}
                                onClick={()=>removeItem(menuItem?._id, restaurant?._id)}
                              >
                                <Minus size={16} />
                              </button>
                              <div className="min-w-12 px-3 text-center text-sm font-bold text-slate-900">
                                {itemQuantity}
                              </div>
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23774] text-white transition hover:bg-[#c72d65]"
                                aria-label={`Increase quantity for ${menuItem?.name ?? "item"}`}
                                onClick={()=>addItems(menuItem?._id, restaurant?._id)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total</p>
                              <p className="mt-1 text-2xl font-black text-slate-900">{formatCurrency(itemTotal)}</p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-semibold text-slate-900">Order summary</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Total items</span>
                    <span className="font-semibold text-slate-900">{quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Total Items Price</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {subtotal > 250 && (
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                  </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Platform Service Fee</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(platformServiceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-orange-100 pt-4 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="text-lg font-black text-slate-900">{formatCurrency(subtotal + deliveryFee + platformServiceFee)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-linear-to-br from-[#E23774] to-[#ff8a5c] p-5 text-white shadow-[0_16px_45px_rgba(226,55,116,0.25)]">
                <p className="text-sm uppercase tracking-[0.28em] text-white/75">Next step</p>
                <h2 className="mt-2 text-2xl font-black">Ready for checkout</h2>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  This panel is styled to fit a later checkout action, but it intentionally stays read-only for now.
                </p>
                <Link
                  to="/checkout"
                  type="button"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#E23774] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                >
                  Checkout preview
                  <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Cart;
