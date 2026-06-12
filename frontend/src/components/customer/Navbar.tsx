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
    <nav className="sticky top-0 z-50 border-b border-brand-border/50 bg-brand-cream/95 backdrop-blur-md shadow-premium-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-5 lg:px-8">
        {/* Logo */}
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-1.5 text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-brand-primary-hover"
          >
            <span className="font-serif text-sm font-extrabold tracking-[0.2em]">GOODFOOD</span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 items-center rounded-full border border-brand-border/80 bg-brand-cream-dark/50 px-4 py-2 transition focus-within:border-brand-primary/50 focus-within:bg-white focus-within:shadow-premium-sm">
          {location.pathname === "/" && (
            <>
              <Search size={16} className="mr-3 shrink-0 text-brand-muted" />

              <input
                type="text"
                placeholder={
                  isHomepage
                    ? "Search restaurants, dishes, cuisines..."
                    : "Search from the menu..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-brand-charcoal outline-none placeholder:text-brand-muted/70"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="ml-2 text-xs text-brand-muted hover:text-brand-charcoal transition"
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
          <div className="hidden items-center gap-1.5 rounded-full border border-brand-border/60 bg-brand-cream-dark/40 px-3 py-1.5 sm:flex">
            <MapPin size={13} className="text-brand-primary shrink-0" />
            <span className="max-w-[8rem] truncate text-xs font-medium text-brand-muted">
              {loadingLocation ? "Detecting..." : city}
            </span>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-9.5 w-9.5 items-center justify-center rounded-full border border-brand-border/80 bg-brand-card text-brand-muted transition hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary"
            aria-label="Cart"
          >
            <ShoppingCart size={16} />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-brand-primary px-1 text-[9px] font-bold leading-none text-white shadow-md">
                {quantity}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuth ? (
            <Link
              to="/account"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-brand-card px-4 py-2 text-xs font-semibold text-brand-muted transition hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5"
            >
              <User size={14} />
              <span>Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-brand-primary-hover"
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
