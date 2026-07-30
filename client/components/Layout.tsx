import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Fireworks } from "./Fireworks";
import { FloatingSparks } from "./FloatingSparks";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#0d0920]">
    {/* Background bursts — subtle, sits behind all page content */}
    <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(91,50,180,.2),transparent_42%),radial-gradient(circle_at_100%_70%,rgba(238,54,157,.08),transparent_35%)]" />
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
