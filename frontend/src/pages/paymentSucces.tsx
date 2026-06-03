import { useEffect } from "react";
import { useAppContext } from "../context/context";
import { Link, useNavigate, useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { fetchCart } = useAppContext();
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_30%),linear-gradient(180deg,#f8fff8_0%,#f1fff4_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-2xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_25px_70px_rgba(16,185,129,0.12)]">
          <div className="bg-linear-to-r from-emerald-500 to-green-500 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">Payment successful</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Your order is confirmed</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
              Thanks for your payment. We’re preparing your order now and will update it once the payment is fully processed.
            </p>
          </div>

          <div className="space-y-6 px-6 py-8 sm:px-10">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Payment ID</p>
              <p className="mt-2 break-all font-mono text-sm text-slate-700">{paymentId || "Not available"}</p>
            </div>

            <div className="grid gap-4 ">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-700 transition hover:-translate-y-0.5 hover:bg-pink-50"
              >
                Continue shopping
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              If the order list does not update immediately, refresh once the payment event finishes processing.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PaymentSuccess;
