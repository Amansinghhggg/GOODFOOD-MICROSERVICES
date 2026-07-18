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
    <main className="min-h-[calc(100vh-5rem)] bg-[#22201B] px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Your selections</p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[#EFEBE3]">Cart</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Items */}
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#3A352F]/60 bg-[#2C2923] px-5 py-4 shadow-premium-sm">
              <div>
                <p className="text-sm font-bold text-[#EFEBE3]">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
                <p className="mt-0.5 text-xs text-[#A39B8F]">Manage your cart below</p>
              </div>
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-full border border-[#3A352F] bg-[#2C2923] px-4 py-2 text-xs font-bold text-[#A39B8F] transition hover:border-brand-error/40 hover:bg-brand-error/5 hover:text-brand-error"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-[#3A352F] bg-[#2C2923]/45 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22201B]-dark/60 text-[#A39B8F]">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#EFEBE3]">Your cart is empty</h2>
                  <p className="mt-1 text-sm text-[#A39B8F]">Add items from a restaurant to get started</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-premium transition hover:bg-brand-primary-hover hover:-translate-y-0.5"
                >
                  Browse restaurants
                  <ArrowRight size={14} />
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
                      className="group overflow-hidden rounded-2xl border border-[#3A352F]/60 bg-[#2C2923] transition hover:border-brand-primary/20 hover:shadow-premium-sm"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Image */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#3A352F] bg-[#22201B]-dark/30">
                          {menuItem?.image ? (
                            <img
                              src={menuItem.image}
                              alt={menuItem.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#A39B8F]/30 bg-[#22201B]-dark/50">
                              <ShoppingBag size={22} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-[#EFEBE3] truncate">
                              {menuItem?.name ?? "Menu item"}
                            </h3>
                            <span className="rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-2.5 py-0.5 text-[10px] font-bold text-brand-secondary">
                              {restaurant?.name ?? "Restaurant"}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-[#A39B8F] leading-relaxed">
                            {menuItem?.description ?? "No description available."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#A39B8F]">
                            <span className="font-semibold text-[#EFEBE3]">{formatCurrency(price)}</span>
                            <span>×</span>
                            <span>{itemQuantity}</span>
                            <span>=</span>
                            <span className="font-bold text-brand-primary">{formatCurrency(itemTotal)}</span>
                          </div>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1 rounded-full border border-[#3A352F] bg-[#22201B]-dark/30 p-1 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => removeItem(menuItem?._id, restaurant?._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#A39B8F] hover:bg-[#22201B]-dark/60 hover:text-[#EFEBE3] transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-[1.8rem] text-center text-xs font-bold text-[#EFEBE3]">
                            {itemQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItems(menuItem?._id, restaurant?._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-hover shadow-premium-sm"
                          >
                            <Plus size={12} />
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
            <div className="rounded-2xl border border-[#3A352F]/60 bg-[#2C2923] p-5 shadow-premium">
              <p className="font-serif text-sm font-bold text-[#EFEBE3] mb-4">Order summary</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#A39B8F]">
                  <span>Total items</span>
                  <span className="text-[#EFEBE3] font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between text-[#A39B8F]">
                  <span>Items price</span>
                  <span className="text-[#EFEBE3] font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#A39B8F]">
                  <span>Delivery fee</span>
                  <span className={subtotal > 250 ? "text-brand-success font-bold" : "text-[#EFEBE3] font-semibold"}>
                    {subtotal > 250 ? "Free" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[#A39B8F]">
                  <span>Platform fee</span>
                  <span className="text-[#EFEBE3] font-semibold">{formatCurrency(platformServiceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-[#3A352F]/60 pt-4 text-sm font-bold text-[#EFEBE3] font-serif">
                  <span>Total</span>
                  <span className="text-brand-primary font-serif text-base font-black">
                    {formatCurrency(subtotal + deliveryFee + platformServiceFee)}
                  </span>
                </div>
              </div>

              {subtotal <= 250 && subtotal > 0 && (
                <div className="mt-4 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-[11px] font-medium text-[#A39B8F] leading-relaxed">
                  Add <span className="font-bold text-brand-primary">{formatCurrency(250 - subtotal)}</span> more for free delivery
                </div>
              )}
            </div>

            <Link
              to="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-xs font-bold text-white shadow-premium hover:bg-brand-primary-hover hover:-translate-y-0.5 transition"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
