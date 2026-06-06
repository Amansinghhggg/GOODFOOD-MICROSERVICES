import { useEffect, useRef, useState } from "react"; 
const SEARCH_DURATION = 10; 
const formatMoney = (value: any) => `₹${Number(value ?? 0).toFixed(2)}`;

interface Props {
  order: any;
  showAction: boolean;
  updateStatus: (order: any) => void;
  statusTone: Record<string, string>;
  nextStatus: (status: string) => string | null;
  isSearchingRider: boolean; // ActiveOrders se aata hai
}
 
const cardButtonLabel = (status: string): string => {
  switch (status) {
    case "placed":     return "Accept Order";
    case "accepted":   return "Start Preparing";
    case "preparing":
    case "preaparing": return "Mark Ready";
    case "ready_for_rider": return "Find Rider";
    default:           return "";
  }
};
 
export default function RessingleOrderTab({
  order,
  showAction,
  updateStatus,
  statusTone,
  nextStatus,
  isSearchingRider,
}: Props) {
  const next = nextStatus(order.status);
  const isRiderAssigned = order.status === "rider_assigned";
 
  const [timeLeft, setTimeLeft] = useState(SEARCH_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
  useEffect(() => {
    if (isSearchingRider) {
      setTimeLeft(SEARCH_DURATION);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
      setTimeLeft(SEARCH_DURATION);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isSearchingRider]);
 
  const progressPct = ((SEARCH_DURATION - timeLeft) / SEARCH_DURATION) * 100;
 
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 
        {/* ── Left: Order Details ── */}
        <div className="flex-1 space-y-4">
 
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-slate-400">
              Order ID:{" "}
              <span className="font-semibold text-slate-600">{order._id}</span>
            </p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide capitalize ${
                statusTone[order.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
 
          {/* Items */}
          <div className="space-y-2">
            {(order.items ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No items found.</p>
            ) : (
              (order.items ?? []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.name}{" "}
                    <span className="font-normal text-slate-500">× {item.quantity}</span>
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))
            )}
          </div>
 
          {/* Footer */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {formatMoney(order.totalAmount)}
              </span>
            </span>
            <span>
              Placed:{" "}
              <span className="font-medium text-slate-700">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
 
        {/* ── Right: Action Button ── */}
        {showAction && (
          <div className="flex-shrink-0 sm:pt-1">
 
            {/* Case 1: rider assigned via socket → permanently disabled */}
            {isRiderAssigned ? (
              <span className="inline-flex rounded-lg bg-violet-100 px-4 py-2 text-sm font-medium text-violet-500">
                Rider Assigned ✓
              </span>
 
            /* Case 2: searching for rider (10s window) */
            ) : isSearchingRider ? (
              <div className="w-44 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="animate-pulse font-medium text-amber-600">
                    Searching for rider…
                  </span>
                  <span>{timeLeft}s</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
 
            /* Case 3: ready_for_rider but timer expired → retry button */
            ) : order.status === "ready_for_rider" ? (
              <button
                onClick={() => updateStatus(order)}
                className="inline-flex rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 active:scale-95"
              >
                Retry Find Rider
              </button>
 
            /* Case 4: normal next-status button */
            ) : next ? (
              <button
                onClick={() => updateStatus(order)}
                className="inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 active:scale-95"
              >
                {cardButtonLabel(order.status)}
              </button>
 
            /* Case 5: no next status */
            ) : (
              <span className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
                Completed
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}