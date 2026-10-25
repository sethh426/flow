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
  const workflowEntry = pathname === "/workflows" || pathname === "/dashboard/workflows";
  const calendarEntry = pathname === "/scheduler" || pathname === "/dashboard/scheduler";
  const contentEntry = pathname === "/content-studio" || pathname === "/dashboard/content-studio";
  return (
    <AuthProvider>
      {authenticationPage ? children : (
        <FlowStudio
          key={pathname}
          initialKind={contentEntry ? "content" : workflowEntry || calendarEntry ? "workflow" : "video"}
          initialPluginId={calendarEntry ? "content-calendar" : workflowEntry ? "brief-check" : undefined}
        />
      )}
    </AuthProvider>
  );
}
