import { useEffect, useState } from "react";
import { useAppContext } from "../context/context";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { Link, useNavigate } from "react-router-dom";
import type { IRestaurant } from "../types";
import toast from "react-hot-toast";
import { MapPin, ShoppingBag, CreditCard, ArrowRight, Plus, CheckCircle2 } from "lucide-react";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const Checkout = () => {
  const { cart, subtotal, quantity, location } = useAppContext();
  const [addresss, setAddresss] = useState([] as Address[]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!cart || quantity === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(`${restaurantService}/api/address/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresss(data.addresses || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddress();
  }, [cart]);

  const navigate = useNavigate();

  if (!cart || quantity === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <ShoppingBag size={24} className="text-white/30" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Cart is empty</h2>
          <p className="mt-2 text-sm text-white/40">Add items to your cart before checkout</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E23774] px-5 py-2.5 text-sm font-semibold text-white">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = Array.isArray(cart)
    ? (cart[0]?.restaurantId as IRestaurant)
    : (cart.restaurantId as IRestaurant);
  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subtotal + deliveryFee + platformFee;
  const restaurantLocation = restaurant?.autoLocation?.coordinates;

  const calculateDistanceKm = (
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number
  ) => {
    const earthRadiusKm = 6371;
    const latDelta = ((toLatitude - fromLatitude) * Math.PI) / 180;
    const lngDelta = ((toLongitude - fromLongitude) * Math.PI) / 180;
    const fromLatRad = (fromLatitude * Math.PI) / 180;
    const toLatRad = (toLatitude * Math.PI) / 180;
    const a =
      Math.sin(latDelta / 2) ** 2 +
      Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(lngDelta / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }
    if (!location || !restaurantLocation) {
      toast.error("Unable to calculate delivery distance right now");
      return;
    }
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod: "razorpay",
          addressId: selectedAddress,
          distance: calculateDistanceKm(
            location.latitude,
            location.longitude,
            restaurantLocation[1],
            restaurantLocation[0]
          ),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder();
      if (!order) return;

      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, { orderId });
      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        Currency: "INR",
        name: "GOODFOOD",
        description: "Food order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("Payment successful");
            navigate(`/order/${orderId}`);
          } catch (error) {
            console.log(error);
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#E23774" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.log(error);
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const isProcessing = loadingRazorpay || creatingOrder;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0a0a0f] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Almost there</p>
          <h1 className="mt-1 text-3xl font-black text-white">Checkout</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Left — Address */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E23774]/20 text-[#E23774]">
                    <MapPin size={15} />
                  </div>
                  <h2 className="text-base font-bold text-white">Delivery Address</h2>
                </div>
                <Link
                  to="/AddAddress"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  <Plus size={12} />
                  Add new
                </Link>
              </div>

              {loadingAddress ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                  ))}
                </div>
              ) : addresss.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-10 text-center">
                  <MapPin size={24} className="text-white/20" />
                  <p className="text-sm text-white/40">No saved addresses</p>
                  <Link
                    to="/AddAddress"
                    className="rounded-full bg-[#E23774] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresss.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => setSelectedAddress(addr._id)}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                        selectedAddress === addr._id
                          ? "border-[#E23774]/50 bg-[#E23774]/10 ring-1 ring-[#E23774]/30"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            selectedAddress === addr._id
                              ? "border-[#E23774] bg-[#E23774]"
                              : "border-white/20"
                          }`}
                        >
                          {selectedAddress === addr._id && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{addr.formattedAddress}</p>
                          <p className="mt-1 text-xs text-white/40">📞 {addr.mobile}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right — Order Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E23774]/20 text-[#E23774]">
                  <ShoppingBag size={15} />
                </div>
                <h2 className="text-base font-bold text-white">Order Summary</h2>
              </div>

              <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <p className="text-xs text-white/40">From</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{restaurant.name}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Items subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Delivery fee</span>
                  <span className={subtotal >= 250 ? "text-emerald-400 font-medium" : "text-white"}>
                    {subtotal >= 250 ? "Free" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Platform fee</span>
                  <span className="text-white">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 text-base font-bold text-white">
                  <span>Total</span>
                  <span className="text-[#E23774]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {subtotal < 250 && (
                <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                  Add {formatCurrency(250 - subtotal)} more for free delivery
                </p>
              )}
            </div>

            <button
              onClick={payWithRazorpay}
              disabled={isProcessing || !selectedAddress}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E23774] py-4 text-sm font-bold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
            >
              <CreditCard size={17} />
              {isProcessing ? "Processing..." : `Pay ${formatCurrency(grandTotal)}`}
              {!isProcessing && <ArrowRight size={16} />}
            </button>

            {!selectedAddress && (
              <p className="text-center text-xs text-white/30">Select a delivery address to continue</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
