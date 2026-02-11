"use client";

import React, { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import HeaderLayout from "@/components/Header/page";

const PrivatePagesLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboarding = pathname?.startsWith("/onboarding");

  useEffect(() => {
    if (loading || !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      {isOnboarding && <div>{children}</div>}
      <HeaderLayout />
      <div className="flex items-center justify-center h-full bg-[linear-gradient(180deg,#FFF7ED_0%,rgba(255,247,237,0)_75%)] relative">
        <div className="h-77 bg-[linear-gradient(180deg,#FFF7ED_0%,rgba(255,247,237,0)_75%)] absolute top-0 left-0 w-full"></div>
        <div className="relative z-10 w-full max-w-285.5 mx-auto pt-8 px-4">{children}</div>
      </div>
    </>
  );
};

export default PrivatePagesLayout;
