import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search, User, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/collections", label: "Collections" },
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
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 border-b border-border/70 ${
        scrolled ? "shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]" : ""
      }`}
    >
      <div className="container-festive flex items-center justify-between px-4 md:px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-full bg-festive grid place-items-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg leading-tight text-foreground uppercase tracking-tight">
            Star
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-primary -mt-0.5">
              Fireworks
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative pb-1 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button className="hidden sm:grid place-items-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary">
            <Search className="w-4 h-4" />
          </button>
          <Link
            to="/admin/login"
            title="Admin Login"
            aria-label="Admin Login"
            className="hidden sm:grid place-items-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary"
          >
            <User className="w-4 h-4" />
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative grid place-items-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary">
            <ShoppingCart className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden grid place-items-center w-10 h-10 rounded-full hover:bg-muted text-foreground/80"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white animate-fade-in-up">
          <nav className="flex flex-col p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg font-semibold uppercase text-sm tracking-wide transition ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
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
