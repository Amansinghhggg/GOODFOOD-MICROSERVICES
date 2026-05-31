import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ShoppingCart, User, Search, ChevronRight, MapPin } from "lucide-react";
import { useAppContext } from "../context/context";

const Navbar = () => {
  const { isAuth, city, loadingLocation ,  user,quantity} = useAppContext();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  console.log("quantity in navbar:", quantity);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);
  if (location.pathname === "/login" || location.pathname === "/select-role" || user?.role === "owner") {
    return null
  }
  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100/80 bg-linear-to-r from-[#fff8f3] via-white to-[#fff3e8] shadow-[0_8px_30px_rgba(226,55,116,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-full bg-[#E23774] px-4 py-2 text-white shadow-lg shadow-[#E23774]/20 transition-transform hover:-translate-y-0.5"
          >
            <span className="text-lg font-extrabold tracking-[0.2em]">GOODFOOD</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center rounded-full border border-orange-200 bg-white/90 px-4 py-3 shadow-sm shadow-orange-100 transition focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
          <Search size={18} className="mr-3 shrink-0 text-[#E23774]" />
          <input
            type="text"
            placeholder={isHomepage ? "Search dishes, restaurants, or cuisines..." : "Search from the menu..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            className="ml-3 rounded-full bg-[#E23774] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c72d65]"
          >
            Search
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 lg:shrink-0">
          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center overflow-visible rounded-full border border-orange-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:border-[#E23774] hover:text-[#E23774]"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#E23774] px-1 text-[10px] font-bold leading-none text-white shadow-md shadow-[#E23774]/25">
                {quantity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-[#E23774] hover:text-[#E23774]"
            >
              <User size={16} />
              <span>Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#E23774] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
            >
              Login
            </Link>
          )}
        </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/0 px-3 py-1 text-sm text-slate-600 sm:flex">
            <MapPin size={16} className="text-[#E23774]" />
            <span className="truncate max-w-40">{loadingLocation ? "Detecting..." : city}</span>
          </div>
      </div>
    </nav>
  );

};

export default Navbar;