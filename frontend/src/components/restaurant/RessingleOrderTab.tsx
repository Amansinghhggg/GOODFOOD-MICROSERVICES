import { useEffect, useRef, useState } from "react"; 
const SEARCH_DURATION = 10; 
const formatMoney = (value: any) => `₹${Number(value ?? 0).toFixed(2)}`;

interface Props {
  isCompleted: boolean;
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
  isCompleted,
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
    <li className="rounded-xl border border-brand-border bg-white p-5 shadow-premium transition-all hover:shadow-premium-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* ── Left: Order Details ── */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Order ID:{" "}
              <span className="font-bold text-brand-charcoal font-mono">{order._id}</span>
            </p>
            <span
              className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold tracking-wide capitalize ${
                isCompleted
                  ? "bg-brand-secondary/10 text-brand-secondary ring-1 ring-brand-secondary/20"
                  : (statusTone[order.status] ?? "bg-brand-cream-dark text-brand-charcoal ring-1 ring-brand-border/60")
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {(order.items ?? []).length === 0 ? (
              <p className="text-sm text-brand-muted">No items found.</p>
            ) : (
              (order.items ?? []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-brand-cream/60 border border-brand-border/30 px-4 py-2"
                >
                  <p className="text-sm font-bold text-brand-charcoal">
                    {item.name}{" "}
                    <span className="font-medium text-brand-muted text-xs">
                      × {item.quantity}
                    </span>
                  </p>
                  <p className="text-sm font-bold text-brand-charcoal">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-brand-muted">
            <span>
              Total:{" "}
              <span className="font-bold text-brand-charcoal">
                {formatMoney(order.totalAmount)}
              </span>
            </span>
            <span>
              Placed:{" "}
              <span className="font-semibold text-brand-charcoal">
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
              <span className="inline-flex rounded-lg bg-brand-secondary/15 px-4 py-2 text-xs font-bold text-brand-secondary border border-brand-secondary/20">
                Rider Assigned ✓
              </span>
            ) : /* Case 2: searching for rider (10s window) */
            isSearchingRider ? (
              <div className="w-44 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="animate-pulse font-semibold text-brand-gold">
                    Searching for rider…
                  </span>
                  <span className="font-bold text-brand-charcoal">{timeLeft}s</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-brand-cream-dark">
                  <div
                    className="h-full rounded-full bg-brand-gold transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : /* Case 3: ready_for_rider but timer expired → retry button */
            order.status === "ready_for_rider" ? (
              <button
                onClick={() => updateStatus(order)}
                className="inline-flex rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-gold/90 shadow-premium-sm hover:shadow-premium active:scale-95"
              >
                Retry Find Rider
              </button>
            ) : /* Case 4: normal next-status button */
            next ? (
              <button
                onClick={() => updateStatus(order)}
                className="inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-primary-hover shadow-premium-sm hover:shadow-premium active:scale-95"
              >
                {cardButtonLabel(order.status)}
              </button>
            ) : (
              /* Case 5: no next status */
              <span className="inline-flex rounded-lg bg-brand-cream-dark px-4 py-2 text-xs font-bold text-brand-muted border border-brand-border/60">
                Completed
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}