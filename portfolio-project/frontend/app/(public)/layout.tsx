import type { ReactNode } from "react";

import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <Navigation />
      <main className="flex-1 relative z-10">{children}</main>
      <footer className="relative z-10">
        <Footer />
      </footer>
    </div>
  );
}
