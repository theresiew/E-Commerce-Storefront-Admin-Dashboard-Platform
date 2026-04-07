import { Menu, ShoppingBag, Shield, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  cn,
  primaryButtonClass,
  secondaryButtonClass,
  shellClass,
} from "../../lib/ui";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
    isActive
      ? "bg-mint-100 text-mint-600"
      : "text-ink-500 hover:bg-mint-100/60 hover:text-mint-600",
  );

export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user, userRole } = useAuth();
  const { totals } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 ${shellClass} px-4 py-3 sm:px-5`}>
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-mint-600 to-mint-500 text-lg font-black text-white">
            N
          </span>
          <div>
            <p className="text-lg font-black text-ink-900">NovaCart</p>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">
              Commerce Platform
            </span>
          </div>
        </NavLink>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-900/10 bg-white/70 text-ink-900 lg:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav
          className={cn(
            "absolute left-4 right-4 top-[calc(100%+0.5rem)] grid gap-3 rounded-[28px] border border-white/70 bg-sand-50 p-4 shadow-[0_20px_50px_rgba(23,31,52,0.15)] lg:static lg:flex lg:flex-1 lg:items-center lg:justify-between lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
            open ? "grid" : "hidden lg:flex",
          )}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
              Storefront
            </NavLink>

            {userRole === "ADMIN" ? (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
                <Shield size={16} />
                Admin Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/cart" className={navLinkClass} onClick={() => setOpen(false)}>
                  <ShoppingBag size={16} />
                  My Cart
                  {totals.quantity > 0 ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-white">
                      {totals.quantity}
                    </span>
                  ) : null}
                </NavLink>

                {isAuthenticated ? (
                  <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>
                    <UserRound size={16} />
                    Profile
                  </NavLink>
                ) : null}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {isAuthenticated ? (
              <>
                <div className="rounded-[22px] bg-mint-100/70 px-4 py-2.5">
                  <strong className="block text-sm text-ink-900">{user?.fullName || "Guest"}</strong>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-mint-600">
                    {userRole}
                  </span>
                </div>
                <button type="button" className={secondaryButtonClass} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={primaryButtonClass} onClick={() => setOpen(false)}>
                Login
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
