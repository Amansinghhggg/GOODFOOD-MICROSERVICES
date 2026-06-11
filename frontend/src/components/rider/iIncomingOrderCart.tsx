import { useEffect, useState } from "react";
import { riderService } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
  distance: number;
  amount: number;
}

const IncomingOrderCart = ({ orderId, onAccepted, distance, amount }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Order accepted successfully!");
      onAccepted();
    } catch (error: any) {
      console.error("Error accepting order:", error.response.data.message);
      toast.error("Failed to accept order.");
    } finally {
      setAccepting(false);
    }
  };

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference - (secondsLeft / 10) * circumference;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Countdown ring */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg
              className="absolute -rotate-90"
              width="48"
              height="48"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(234,179,8,0.15)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#eab308"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s linear" }}
              />
            </svg>
            <span className="text-sm font-black text-yellow-400">
              {secondsLeft}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">New Order!</p>
            <p className="text-xs text-gray-400 font-mono">
              #{orderId.slice(-8)}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-cyan-400">
                Distance
              </p>
              <p className="text-sm font-bold text-white">{distance.toFixed(2)} km</p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-yellow-400">
                Amount
              </p>
              <p className="text-sm font-bold text-white">₹{amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={acceptOrder}
          disabled={accepting}
          className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-900/40 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          {accepting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Accepting…
            </>
          ) : (
            "Accept"
          )}
        </button>
      </div>
    </div>
  );
};

export default IncomingOrderCart;
