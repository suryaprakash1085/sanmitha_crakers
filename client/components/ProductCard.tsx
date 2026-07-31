import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Tilt3D } from "@/components/Tilt3D";

interface Props { product: Product; index?: number; onImageClick?: (p: Product) => void; }

const CARD_ACCENTS = [
  { from: "hsl(316 80% 55%)", to: "hsl(263 70% 58%)", img: "hsl(316 60% 97%)", btn: "hsl(316 80% 55%)" },
  { from: "hsl(23 90% 55%)",  to: "hsl(43 95% 55%)",  img: "hsl(23 80% 97%)",  btn: "hsl(23 90% 55%)"  },
  { from: "hsl(200 80% 50%)", to: "hsl(220 80% 58%)", img: "hsl(200 60% 97%)", btn: "hsl(200 80% 50%)" },
];

export const ProductCard = ({ product, index = 0, onImageClick }: Props) => {
  const [bursting, setBursting] = useState(false);
  const { add } = useCart();
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBursting(true);
    setTimeout(() => setBursting(false), 900);
    add(product);
    toast.success(`${product.name} added to your cart`);
  };

  return (
    <Tilt3D max={7} lift={14} className="h-full">
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.06 }}
        className="product-card group h-full"
      >
        {product.badge && (
          <span className="glow-badge absolute top-4 left-4 z-10">{product.badge}</span>
        )}

        {/* Image container */}
        <button
          type="button"
          onClick={() => onImageClick?.(product)}
          className="relative h-44 mb-4 grid place-items-center overflow-hidden rounded-2xl w-full cursor-zoom-in transition-all"
          style={{ background: accent.img }}
        >
          {/* Glowing backdrop */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at center, ${accent.from}22, transparent 70%)`,
            }}
          />
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-40 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 drop-shadow-lg relative z-10"
          />
        </button>

        <h3 className="font-display font-semibold text-base text-gray-800 mb-0.5">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{product.category}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-xl text-gradient-festive">₹{product.price}</span>
          <button
            onClick={handleAdd}
            className="relative inline-flex items-center gap-1.5 rounded-xl text-white text-sm font-semibold px-4 py-2 hover:brightness-110 transition-all shadow-md overflow-visible"
            style={{ background: `linear-gradient(120deg, ${accent.from}, ${accent.to})` }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
            {bursting && (
              <span className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (Math.PI * 2 * i) / 12;
                  const d = 32;
                  const hue = [6, 42, 340, 200][i % 4];
                  return (
                    <span
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: `hsl(${hue} 90% 65%)`,
                        boxShadow: `0 0 8px hsl(${hue} 90% 65%)`,
                        animation: `spark-fly 0.8s ease-out forwards`,
                        ["--tx" as any]: `${Math.cos(a) * d}px`,
                        ["--ty" as any]: `${Math.sin(a) * d}px`,
                      }}
                    />
                  );
                })}
              </span>
            )}
          </button>
        </div>
      </motion.article>
      <style>{`@keyframes spark-fly{to{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}`}</style>
    </Tilt3D>
  );
};
