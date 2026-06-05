import { useAppContext } from "../context/context";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Home, Mail, Package, ShieldCheck, LogOut, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { restaurantService } from "../main";
import axios from "axios";

type Address = {
  _id: string;
  mobile: number;
  formattedAddress: string;
};

const Account = () => {
  const { setIsAuth, setUser, user, location, city } = useAppContext();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address[]>([]);
  const [orders, setOrders] = useState([] as any[]);
  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
    }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-orange-100 bg-white px-8 py-10 text-center shadow-lg shadow-orange-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E23774]/10 text-[#E23774]">
            <User size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">No account data found</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in again to view your profile.</p>
        </div>
      </div>
    );
  }

  const avatar = user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=E23774&color=fff`;
  const primaryAddress = location?.formattedAddress || city;
  async function fetchAddress(){
    try {
      const {data} = await axios.get(`${restaurantService}/api/address/all`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setAddress(Array.isArray(data?.addresses) ? data.addresses : []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }
  async function fetchOrders() {

    const { data } = await axios.get(`${restaurantService}/api/order/customer/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

    });
    setOrders(Array.isArray(data?.orders) ? data.orders : []);
  } 

  useEffect(() => {
    fetchAddress();
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-4xl border border-orange-100 bg-white shadow-[0_20px_60px_rgba(226,55,116,0.10)]">
        <div className="bg-linear-to-r from-[#E23774] via-[#f65d95] to-[#ff8a5c] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 shadow-lg">
                <img
                  src={avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/75">
                  My Account
                </p>
                <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  Manage your profile and session.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#E23774] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-3xl border border-orange-100 bg-orange-50/40 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Profile Details
            </h2>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <Mail size={18} className="text-[#E23774]" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Email
                </p>
                <p className="font-medium text-slate-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <ShieldCheck size={18} className="text-[#E23774]" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Role
                </p>
                <p className="font-medium capitalize text-slate-800">
                  {user.role || "Role not selected"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-orange-200 bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#E23774]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Current Area
                  </p>
                  <p className="font-medium text-slate-800">{primaryAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Account Summary
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    User ID
                  </p>
                  <p className="mt-1 break-all text-sm text-white/90">
                    {user._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Login Status
                  </p>
                  <p className="mt-1 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                    Active session
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E23774]/10 text-[#E23774]">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Your Orders
                    </h2>
                    <p className="text-sm text-slate-500">
                      Keep track of what you ordered recently.
                    </p>
                  </div>
                </div>
                {/* <Link size={18} className="text-slate-400" /> */}
              </div>

              <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-4">
                    <p className="font-medium text-slate-900">
                      No recent orders yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your order history will appear here after you place your
                      first order.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Link
                      to={`/order/${order._id}`}
                      key={order._id}
                      className="block rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {order.restaurantName}
                        </h3>

                        <span className="text-xs text-slate-500">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {order.items
                          .slice(0, 2)
                          .map((item: any) => item.name)
                          .join(", ")}
                        {order.items.length > 2 &&
                          ` +${order.items.length - 2} more`}
                      </p>

                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{order.status}</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E23774]/10 text-[#E23774]">
                    <Home size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Addresses
                    </h2>
                    <p className="text-sm text-slate-500">
                      Manage your delivery address details.
                    </p>
                  </div>
                </div>
              </div>

              {address.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-orange-200 bg-white p-4 text-sm text-slate-500">
                  No saved address.
                </div>
              ) : (
                <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {address.map((addr) => (
                    <div
                      key={addr._id}
                      className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {addr.formattedAddress}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Mobile: {addr.mobile}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/AddAddress"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#E23774] hover:text-[#E23774]"
              >
                Add new address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
