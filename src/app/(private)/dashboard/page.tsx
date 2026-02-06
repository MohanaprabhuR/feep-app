"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon, LogOut } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const DashboardPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <>
      <div className="flex justify-between w-full items-center">
        <h3 className="font-medium text-3xl leading-8 tracking-4">My Policies</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="size-4" /> Logout
          </Button>
          <Button className="gap-0.5">
            <PlusIcon className="size-5" /> Add
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
