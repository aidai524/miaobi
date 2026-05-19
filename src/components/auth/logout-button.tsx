"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  variant = "default",
  children,
}: {
  variant?: "default" | "icon";
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function logout() {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      variant={variant === "icon" ? "ghost" : "outline"}
      size={variant === "icon" ? "icon" : "sm"}
      className={variant === "icon" ? "h-8 w-8 rounded-lg" : undefined}
      onClick={logout}
      disabled={isSubmitting}
    >
      {children ?? (
        <>
          <LogOut className="h-4 w-4" />
          退出登录
        </>
      )}
    </Button>
  );
}
