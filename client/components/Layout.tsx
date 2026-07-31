import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Fireworks } from "./Fireworks";
import { FloatingSparks } from "./FloatingSparks";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#fafafa]">
    {/* Soft festive ambient blobs */}
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 80% 0%, hsl(316 80% 55% / .05), transparent 70%)," +
          "radial-gradient(ellipse 50% 35% at 0% 80%, hsl(263 70% 55% / .05), transparent 70%)," +
          "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(43 96% 59% / .03), transparent 70%)",
      }}
    />
    <Fireworks />
    <Navbar />
    <main className="relative z-10 pt-[76px]">{children}</main>
    <Footer />

    {/* Floating embers — small glowing dots */}
    <div className="fixed inset-0 pointer-events-none z-[45]">
      <FloatingSparks count={12} />
    </div>
  </div>
);
