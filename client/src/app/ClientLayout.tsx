"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import FlowStudio from "@/features/studio/FlowStudio";

/** Every product entry point opens the same floating creation workspace. */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const authenticationPage =
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup";
  return (
    <AuthProvider>
      {authenticationPage ? children : <FlowStudio />}
    </AuthProvider>
  );
}
