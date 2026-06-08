import axios from "axios";
import React from "react";
import { riderService } from "../../main";
import toast from "react-hot-toast";

interface CurrentOrderProps {
  order: any;
  onstatusUpdate: () => void;
}
type OrderStatus =
  | "rider_assigned"
  | "picked_up"
  | "delivered";

const nextStatus = (status: OrderStatus): string => {
    switch (status) {
        case "rider_assigned":
            return "picked_up";

        case "picked_up":
            return "delivered";
        default:
            return "??????";
    }
};

const CurrentOrder = ({
  order,
  onstatusUpdate,
}: CurrentOrderProps) => {
  const [otp, setOtp] = React.useState("");
const [verifyingOtp, setVerifyingOtp] = React.useState(false);
    const [updating, setUpdating] = React.useState(false);
  const isPickedUp = order.status !== "rider_assigned"
  const updateOrderStatus = async () => {
    
    setUpdating(true);
    try {
        await axios.put(`${riderService}/api/rider/order/update/${order._id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        onstatusUpdate();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdating(false);
    }
  }

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
        const { data } = await axios.post(`${riderService}/api/rider/order/verify/otp/${order._id}`, { otp }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
        });
        if(data.success){
            toast.success("OTP verified successfully! Delivery completed Thank you.");
            window.location.reload();  
          } else {
            toast.error("Invalid OTP. Please try again.");
        }
    } catch (error) {
      toast.error("Error verifying OTP:");
      console.error("Error verifying OTP:", error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-yellow-500/20 bg-black/40 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Order</h2>

          <p className="text-sm text-gray-400">#{order._id}</p>
        </div>

        <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400">
          {order.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* Earnings */}
      <div className="mt-6 rounded-xl bg-green-500/10 p-4">
        <p className="text-sm text-gray-400">Earnings</p>

        <p className="text-3xl font-bold text-green-400">
          ₹{order.riderAmount}
        </p>
      </div>

      {/* Distance */}
      <div className="mt-4 rounded-xl border border-yellow-500/20 p-4">
        <p className="text-sm text-gray-400">Distance</p>

        <p className="mt-2 text-lg font-semibold text-white">
          {order.distance.toFixed(1)} km
        </p>
      </div>

      {/* Restaurant Section */}
      {!isPickedUp && (
        <div className="mt-4 rounded-xl border border-yellow-500/20 p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Pickup From</h3>

          <img
            src={order.restaurantId.image}
            alt={order.restaurantId.name}
            className="h-48 w-full rounded-xl object-cover"
          />

          <h4 className="mt-4 text-xl font-bold text-white">
            {order.restaurantId.name}
          </h4>

          <p className="mt-2 text-gray-300">{order.restaurantId.description}</p>

          <p className="mt-3 text-gray-400">
            {order.restaurantId.autoLocation.formattedAddress}
          </p>

          <div className="mt-4 flex gap-3">
            <a
              href={`tel:${order.restaurantId.phone}`}
              className="rounded-xl bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
            >
              Call Restaurant
            </a>

            <a
              href={`https://www.google.com/maps?q=${order.restaurantId.autoLocation.coordinates[1]},${order.restaurantId.autoLocation.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
            >
              Open Maps
            </a>
          </div>
        </div>
      )}

      {isPickedUp && (
        <div className="mt-4 rounded-xl border border-yellow-500/20 p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Deliver To</h3>

          <p className="text-gray-300">
            {order.deliveryAddress.formattedAddress}
          </p>

          <p className="mt-3 text-yellow-400">
            Customer: {order.deliveryAddress.mobile}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`tel:${order.deliveryAddress.mobile}`}
              className="rounded-xl bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
            >
              Call Customer
            </a>

            <a
              href={`https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
            >
              Open Maps
            </a>
          </div>
          
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <h4 className="text-lg font-semibold text-white">
              Delivery OTP Verification
            </h4>

            <p className="mt-1 text-sm text-gray-400">
              Ask customer for the 4-digit OTP before completing delivery.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="w-full rounded-xl border border-yellow-500/30 bg-black/30 px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white outline-none focus:border-pink-500"
              />

              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length !== 4}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mt-4 rounded-xl border border-yellow-500/20 p-4">
        <h3 className="mb-3 text-lg font-semibold text-white">Order Items</h3>

        {order.items.map((item: any) => (
          <div
            key={item._id}
            className="mb-2 flex items-center justify-between"
          >
            <p className="text-white">
              {item.quantity} × {item.name}
            </p>

            <p className="text-gray-300">₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="mt-4 rounded-xl border border-yellow-500/20 p-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Amount</span>

          <span className="font-semibold text-white">₹{order.totalAmount}</span>
        </div>

        <div className="mt-2 flex justify-between">
          <span className="text-gray-400">Payment</span>

          <span className="text-green-400">{order.paymentStatus}</span>
        </div>
      </div>

      {/* Action Button */}
      {order.status !== "delivered" && order.status !== "picked_up" && (
        <button
          onClick={updateOrderStatus}
          disabled={updating || order.status === "delivered"}
          className="mt-6 w-full rounded-xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-500"
        >
          {updating ? "Updating..." : `${nextStatus(order.status)}`}
        </button>
      )}
    </div>
  );
};

export default CurrentOrder;