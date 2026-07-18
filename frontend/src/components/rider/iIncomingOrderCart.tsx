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
    <div className="mt-3 overflow-hidden rounded-xl border border-brand-primary/20 bg-[#22201B]/60 p-4 shadow-premium-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
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
                stroke="rgba(212,63,41,0.15)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#D43F29"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s linear" }}
              />
            </svg>
            <span className="text-sm font-extrabold text-brand-primary">
              {secondsLeft}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#EFEBE3]">New Order Available!</p>
            <p className="text-xs text-[#A39B8F] font-mono font-bold">
              #{orderId.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-brand-secondary/20 bg-brand-secondary/5 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">
                Distance
              </p>
              <p className="text-xs font-extrabold text-[#EFEBE3]">{distance.toFixed(2)} km</p>
            </div>
            <div className="rounded-lg border border-brand-gold/20 bg-brand-gold/5 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#b07c1e]">
                Amount
              </p>
              <p className="text-xs font-extrabold text-[#EFEBE3]">₹{amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={acceptOrder}
          disabled={accepting}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-secondary px-5 py-2.5 text-sm font-bold text-white shadow-premium-sm transition-all hover:bg-brand-secondary-hover disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
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
