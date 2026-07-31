import { ReactNode, useRef } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
  /** how much the content "lifts" toward the viewer, in px */
  lift?: number;
  /** enable glare effect */
  glare?: boolean;
}

/**
 * Tilt3D — wraps content in a perspective card that tilts toward the
 * cursor and lifts slightly on hover, giving a crisp 3D feel.
 * Pointer-driven, reverts smoothly with CSS transition on mouse leave.
 */
export const Tilt3D = ({ children, className = "", max = 10, lift = 14, glare = false }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 → 1
    const py = (e.clientY - rect.top)  / rect.height;  // 0 → 1
    const rotateY =  (px - 0.5) * max * 2;
    const rotateX = -(py - 0.5) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${lift}px)`;

    if (glare && glareRef.current) {
      const angle = Math.atan2(py - 0.5, px - 0.5) * (180 / Math.PI);
      glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.22) 0%, transparent 60%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d] ${className}`}
      style={{ filter: "drop-shadow(0 0 0 transparent)" }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 transition-opacity duration-300"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </div>
  );
};
