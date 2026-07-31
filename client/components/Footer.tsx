import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Gem,
  ShieldCheck,
  Leaf,
  Truck,
  Award,
} from "lucide-react";

const features = [
  { icon: Gem,        title: "Premium Quality",        desc: "Finest quality products for extra brightness.",         color: "hsl(316 80% 55%)" },
  { icon: ShieldCheck,title: "Safe & Certified",        desc: "100% safe products with BIS certification.",            color: "hsl(200 80% 50%)" },
  { icon: Leaf,       title: "Eco Friendly",            desc: "Environment safe fireworks.",                           color: "hsl(142 65% 45%)" },
  { icon: Truck,      title: "Fast Delivery",           desc: "On-time delivery guaranteed.",                          color: "hsl(23 90% 52%)" },
  { icon: Award,      title: "Best Price Guarantee",    desc: "Get the best quality at affordable prices.",            color: "hsl(43 95% 50%)" },
];

export const Footer = () => (
  <footer className="relative bg-gray-50 border-t border-gray-100">
    {/* Feature strip */}
    <div className="bg-white border-b border-gray-100">
      <div className="container-festive grid gap-6 sm:grid-cols-2 lg:grid-cols-5 py-10 px-4 md:px-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 group">
            <div
              className="w-11 h-11 shrink-0 rounded-2xl grid place-items-center text-white shadow-md group-hover:scale-110 transition-transform"
              style={{ background: f.color }}
            >
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-gray-800">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main footer */}
    <div className="bg-gray-50">
      <div className="container-festive py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5 px-4 md:px-8">
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-festive grid place-items-center shadow-md">
              <img
                src="/favicon.ico"
                alt="Sanmitha Fireworks Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="font-display font-extrabold text-lg text-gray-900 uppercase">
              Sanmitha Fireworks
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            Lighting up your celebrations with premium quality crackers since 2010.
          </p>
          <div className="flex gap-2 mt-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 grid place-items-center rounded-full border border-gray-200 text-gray-400 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3 text-gray-800">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {["Home", "About", "Services", "Products", "Offers", "Contact"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-pink-600 transition">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3 text-gray-800">Categories</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {["Rockets", "Sparklers", "Fountains", "Bombs", "Gift Boxes"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-pink-600 transition">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3 text-gray-800">Customer Service</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {["My Orders", "Shipping Policy", "Returns & Refunds", "FAQ", "Track Order"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-pink-600 transition">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3 text-gray-800">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-3">Get festive offers in your inbox.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 text-sm py-2 px-3 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
            />
            <button type="submit" className="btn-spark !px-4 !py-2 !rounded-xl text-sm">
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-200 py-5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 container-festive">
        <span className="text-xs text-gray-400">
          © {new Date().getFullYear()} Sanmitha Fireworks. All rights reserved.
        </span>
        <div className="flex gap-2">
          {["Visa", "Mastercard", "UPI", "Paytm"].map((p) => (
            <span key={p} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-500">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
