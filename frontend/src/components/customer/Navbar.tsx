import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ShoppingCart, User, Search, MapPin } from "lucide-react";
import { useAppContext } from "../../context/context";

const Navbar = () => {
  const { isAuth, city, loadingLocation, user, quantity } = useAppContext();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

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

  if (
    location.pathname === "/login" ||
    location.pathname === "/select-role" ||
    user?.role === "owner"
  ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-5 lg:px-8">
        {/* Logo */}
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-[#E23774] px-4 py-2 text-white shadow-lg shadow-[#E23774]/25 transition hover:-translate-y-0.5"
          >
            <span className="text-sm font-extrabold tracking-[0.22em]">GOODFOOD</span>
          </Link>
        </div>

        {/* Search bar */}
       
          <div className="flex flex-1 items-center rounded-full border border-white/5 bg-white/[0.06] px-4 py-2.5 transition focus-within:border-[#E23774]/50 focus-within:bg-white/[0.08]">
  {location.pathname === "/" && (
    <>
      <Search size={16} className="mr-3 shrink-0 text-white/30" />

      <input
        type="text"
        placeholder={
          isHomepage
            ? "Search restaurants, dishes, cuisines..."
            : "Search from the menu..."
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
      />

      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="ml-2 text-xs text-white/30 hover:text-white/60 transition"
        >
          ✕
        </button>
      )}
    </>
  )}
</div>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2 lg:shrink-0">
          {/* Location pill */}
          <div className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-2 sm:flex">
            <MapPin size={13} className="text-[#E23774] shrink-0" />
            <span className="max-w-[8rem] truncate text-xs text-white/45">
              {loadingLocation ? "Detecting..." : city}
            </span>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.04] text-white/60 transition hover:border-[#E23774]/40 hover:bg-[#E23774]/10 hover:text-[#E23774]"
            aria-label="Cart"
          >
            <ShoppingCart size={17} />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-[#E23774] px-1 text-[9px] font-bold leading-none text-white shadow-md shadow-[#E23774]/30">
                {quantity}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuth ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/60 transition hover:border-white/10 hover:text-white"
            >
              <User size={15} />
              <span>Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#E23774] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65]"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
