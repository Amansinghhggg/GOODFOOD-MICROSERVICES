import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import type { IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const Cart = () => {
  const { cart, subtotal, quantity, fetchCart } = useAppContext();
  const cartItems = Array.isArray(cart) ? cart : [];
  const deliveryFee = subtotal > 250 ? 0 : 49;
  const platformServiceFee = 7;

  async function removeItem(itemsId?: string, restaurantId?: string) {
    try {
      await axios.put(
        `${restaurantService}/api/cart/remove`,
        { restaurantId, itemsId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  }

  async function addItems(itemsId?: string, restaurantId?: string) {
    try {
      await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemsId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  }

  async function clearCart() {
    try {
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#0a0a0f] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#E23774]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Your selections</p>
          <h1 className="mt-1 text-3xl font-black text-white">Cart</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Items */}
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
                <p className="mt-0.5 text-xs text-white/40">Manage your cart below</p>
              </div>
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/50 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/20">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
                  <p className="mt-1 text-sm text-white/40">Add items from a restaurant to get started</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-[#E23774] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
                >
                  Browse restaurants
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((cartItem) => {
                  const menuItem = cartItem.itemsId as IMenuItem | undefined;
                  const restaurant = cartItem.restaurantId as IRestaurant | undefined;
                  const itemQuantity = cartItem.quantity;
                  const price = menuItem?.price ?? 0;
                  const itemTotal = price * itemQuantity;

                  return (
                    <article
                      key={cartItem._id}
                      className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10 hover:bg-white/[0.05]"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Image */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
                          {menuItem?.image ? (
                            <img
                              src={menuItem.image}
                              alt={menuItem.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/20">
                              <ShoppingBag size={22} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-bold text-white">
                              {menuItem?.name ?? "Menu item"}
                            </h3>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50">
                              {restaurant?.name ?? "Restaurant"}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-white/40">
                            {menuItem?.description ?? "No description available."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-semibold text-white">{formatCurrency(price)}</span>
                            <span className="text-white/30">×</span>
                            <span className="text-white/50">{itemQuantity}</span>
                            <span className="text-white/30">=</span>
                            <span className="font-bold text-[#E23774]">{formatCurrency(itemTotal)}</span>
                          </div>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.04] p-1 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => removeItem(menuItem?._id, restaurant?._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-bold text-white">
                            {itemQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItems(menuItem?._id, restaurant?._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E23774] text-white transition hover:bg-[#c72d65]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Summary sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <p className="text-sm font-bold text-white mb-5">Order summary</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Total items</span>
                  <span className="text-white font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Items price</span>
                  <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Delivery fee</span>
                  <span className={subtotal > 250 ? "text-emerald-400 font-medium" : "text-white font-medium"}>
                    {subtotal > 250 ? "Free" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Platform fee</span>
                  <span className="text-white font-medium">{formatCurrency(platformServiceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-4 text-base font-black text-white">
                  <span>Total</span>
                  <span className="text-[#E23774]">
                    {formatCurrency(subtotal + deliveryFee + platformServiceFee)}
                  </span>
                </div>
              </div>

              {subtotal <= 250 && subtotal > 0 && (
                <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400">
                  Add {formatCurrency(250 - subtotal)} more for free delivery
                </p>
              )}
            </div>

            <Link
              to="/checkout"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E23774] py-4 text-sm font-bold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
