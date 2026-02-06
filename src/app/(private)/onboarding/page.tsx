"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          router.push("/");
          return;
        }
        
        if (!user) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("personal_details")
          .select("current_step, completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching onboarding step:", error);
          // If error, default to step 1
          router.push("/onboarding/step-1");
          return;
        }

        // If onboarding is fully completed, redirect to dashboard
        if (data?.completed) {
          router.push("/dashboard");
        } else if (data?.current_step >= 5) {
          // User has finished 4 steps, go to success page (step 5)
          router.push("/onboarding/step-5");
        } else {
          router.push(`/onboarding/step-${data?.current_step || 1}`);
        }
      } catch (err) {
        console.error("Error in onboarding load:", err);
        router.push("/onboarding/step-1");
      }
    };

    load();
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
}
