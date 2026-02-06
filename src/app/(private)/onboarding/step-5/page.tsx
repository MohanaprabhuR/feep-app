"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OnboardingSuccess = () => {
  const router = useRouter();

  const handleGoToDashboard = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Please log in again.");
        router.push("/");
        return;
      }

      // Mark onboarding as fully completed
      const { error: dbError } = await supabase
        .from("personal_details")
        .update({
          completed: true,
          current_step: 5,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (dbError) {
        console.error("Error marking onboarding complete:", dbError);
        toast.error("Could not complete onboarding. Please try again.");
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error("Error in onboarding success:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="px-32 py-16 flex flex-col gap-y-6">
      <h1 className="text-2xl font-semibold">Onboarding Complete</h1>
      <p className="text-base text-muted-foreground">
        You&apos;re all set. Click below to view your personalized dashboard.
      </p>
      <div>
        <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
      </div>
    </div>
  );
};

export default OnboardingSuccess;
