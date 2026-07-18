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
    <main className="min-h-[calc(100vh-5rem)] bg-[#22201B] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-[#3A352F]/60 bg-[#2C2923] shadow-premium-lg">
          {/* Top banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-secondary to-[#2d5d45] px-8 py-10 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2C2923]/5" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#2C2923]/5" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2C2923]/10 backdrop-blur-sm shadow-premium-sm">
                <CheckCircle size={24} className="text-white" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Payment successful</p>
              <h1 className="mt-2 font-serif text-2xl font-black">Order confirmed!</h1>
              <p className="mt-2 text-xs leading-relaxed text-white/85">
                We're preparing your order now. You'll get updates as it's picked up and delivered.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 px-8 py-7">
            {paymentId && (
              <div className="rounded-xl border border-[#3A352F] bg-[#22201B]-dark/50 p-4 shadow-premium-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A39B8F]">Payment Reference</p>
                <p className="mt-1.5 break-all font-mono text-xs text-[#EFEBE3] font-semibold">{paymentId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-bold text-white shadow-premium hover:bg-brand-primary-hover hover:-translate-y-0.5 transition"
              >
                <ShoppingBag size={14} />
                Continue shopping
                <ArrowRight size={14} />
              </Link>
            </div>

            <p className="text-center text-[10px] text-[#A39B8F]/70 leading-normal">
              Order list updates once payment processing completes. Refresh if it doesn't appear.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PaymentSuccess;
