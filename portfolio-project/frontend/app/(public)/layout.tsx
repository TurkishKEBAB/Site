import type { ReactNode } from "react";

import NexusBackground from "@/components/NexusBackground";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <NexusBackground />
      <Navigation />
      <main className="flex-1 relative z-10">{children}</main>
      <footer className="relative z-10">
        <Footer />
      </footer>
    </div>
  );
}
