import { useEffect } from "react";
import { useAppContext } from "../context/context";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";

const PaymentSuccess = () => {
  const { fetchCart } = useAppContext();
  const { paymentId } = useParams<{ paymentId: string }>();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#0a0a0f] px-4 py-10 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          {/* Top banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-10">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <CheckCircle size={28} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Payment successful</p>
              <h1 className="mt-2 text-3xl font-black">Order confirmed!</h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
                We're preparing your order now. You'll get updates as it's picked up and delivered.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 px-8 py-7">
            {paymentId && (
              <div className="rounded-xl border border-white/5 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Payment Reference</p>
                <p className="mt-2 break-all font-mono text-sm text-white/80">{paymentId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E23774] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
              >
                <ShoppingBag size={16} />
                Continue shopping
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-center text-xs text-white/25">
              Order list updates once payment processing completes. Refresh if it doesn't appear.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PaymentSuccess;
