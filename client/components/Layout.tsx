import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Fireworks } from "./Fireworks";
import { FloatingSparks } from "./FloatingSparks";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-screen bg-white overflow-hidden">
    {/* Background bursts — subtle, sits behind all page content */}
    <Fireworks />
    <Navbar />
    <main className="relative z-10 pt-[76px]">{children}</main>
    <Footer />

    {/* Floating embers — small glowing dots only, rendered in front so the
        animation stays visible over solid section backgrounds, without ever
        painting a full translucent layer over text/content */}
    <div className="fixed inset-0 pointer-events-none z-[45]">
      <FloatingSparks count={16} />
    </div>
  </div>
);
