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
    <nav className="sticky top-0 z-50 border-b border-[#3A352F] bg-[#2C2923]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-5 lg:px-8">
        {/* Logo */}
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <span className="font-serif text-2xl font-black tracking-tighter text-[#EFEBE3]">
              GOOD<span className="text-brand-primary">FOOD</span>
            </span>
          </Link>
        </div>

        {/* Search bar or blank space */}
        {isHomepage ? (
          <div className="flex flex-1 items-center rounded-full border border-[#3A352F] bg-[#22201B] px-4 py-2 transition focus-within:border-[#ff385c]/50 focus-within:bg-[#2C2923] focus-within:shadow-sm">
            <Search size={16} className="mr-3 shrink-0 text-[#877E71]" />
            <input
              type="text"
              placeholder="Search restaurants, dishes, cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#EFEBE3] outline-none placeholder:text-[#877E71]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="ml-2 text-xs text-[#877E71] hover:text-[#EFEBE3] transition"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right actions */}
        <div className="flex items-center justify-end gap-3 lg:shrink-0">
          {/* Location pill */}
          <div className="hidden items-center gap-2 rounded-full border border-[#3A352F] bg-[#22201B] px-4 py-2 sm:flex">
            <MapPin size={14} className="text-[#ff385c] shrink-0" />
            <span className="max-w-[8rem] truncate text-xs font-semibold text-[#A39B8F]">
              {loadingLocation ? "Detecting..." : city}
            </span>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#3A352F] bg-[#2C2923] text-[#A39B8F] transition hover:border-[#ff385c]/40 hover:bg-[#ff385c]/5 hover:text-[#ff385c]"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-[#ff385c] px-1.5 text-[10px] font-bold leading-none text-white shadow-md">
                {quantity}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuth ? (
            <Link
               to="/account"
               className="inline-flex items-center gap-2 rounded-full border border-[#3A352F] bg-[#2C2923] px-5 py-2 text-sm font-semibold text-[#A39B8F] transition hover:border-[#ff385c]/40 hover:text-[#ff385c] hover:bg-[#ff385c]/5"
             >
               <User size={16} />
               <span>Account</span>
             </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff385c] px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#e0273f]"
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
