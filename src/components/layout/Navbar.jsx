import { Menu, ShoppingBag, Shield, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const baseLinkClass = ({ isActive }) =>
  `nav-link ${isActive ? "nav-link-active" : ""}`;

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
    <header className="site-header">
      <div className="container nav-row">
        <NavLink to="/" className="brand-mark" onClick={() => setOpen(false)}>
          <span className="brand-badge">N</span>
          <div>
            <p>NovaCart</p>
            <span>Commerce Platform</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`nav-panel ${open ? "nav-panel-open" : ""}`}>
          <NavLink to="/" className={baseLinkClass} onClick={() => setOpen(false)}>
            Storefront
          </NavLink>

          {userRole === "ADMIN" ? (
            <NavLink
              to="/admin"
              className={baseLinkClass}
              onClick={() => setOpen(false)}
            >
              <Shield size={16} />
              Admin Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/cart"
                className={baseLinkClass}
                onClick={() => setOpen(false)}
              >
                <ShoppingBag size={16} />
                My Cart
                {totals.quantity > 0 ? (
                  <span className="cart-pill">{totals.quantity}</span>
                ) : null}
              </NavLink>

              {isAuthenticated ? (
                <NavLink
                  to="/profile"
                  className={baseLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <UserRound size={16} />
                  Profile
                </NavLink>
              ) : null}
            </>
          )}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="identity-chip">
                  <strong>{user?.fullName || "Guest"}</strong>
                  <span>{userRole}</span>
                </div>
                <button type="button" className="ghost-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="primary-button small-button"
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
