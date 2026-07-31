import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search, User, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/home", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/", label: "Products" },
  { to: "/collections", label: "Collections" },
  { to: "/quick-order", label: "Quick Order" },
  { to: "/offers", label: "Offers" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,.08)] border-b border-gray-100"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100/60"
      }`}
    >
      <div className="container-festive flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-full bg-festive grid place-items-center shadow-[0_4px_14px_rgba(216,52,183,.35)] group-hover:scale-110 transition-transform">
            <img
              src="/favicon.ico"
              alt="Sanmitha Fireworks Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-display font-extrabold text-lg leading-tight text-gray-900 uppercase tracking-tight">
            Sanmitha
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-gradient-festive -mt-0.5">
              Fireworks
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/" || l.to === "/home"}
              className={({ isActive }) =>
                `relative pb-1 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? "text-pink-600" : "text-gray-600 hover:text-pink-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-festive transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="hidden sm:grid place-items-center w-9 h-9 rounded-full hover:bg-pink-50 transition-colors text-gray-500 hover:text-pink-600">
            <Search className="w-4 h-4" />
          </button>
          <Link
            to="/admin/login"
            title="Admin Login"
            aria-label="Admin Login"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-full hover:bg-pink-50 transition-colors text-gray-500 hover:text-pink-600"
          >
            <User className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid place-items-center w-9 h-9 rounded-full hover:bg-pink-50 transition-colors text-gray-500 hover:text-pink-600"
          >
            <ShoppingCart className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-festive text-white text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden grid place-items-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in-up shadow-xl">
          <nav className="flex flex-col p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/" || l.to === "/home"}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl font-semibold uppercase text-sm tracking-wide transition ${
                    isActive
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
