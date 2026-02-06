"use client";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import client from "@/api/client";
import Auth from "@/components/Auth/Auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check if onboarding is complete
      const checkOnboarding = async () => {
        try {
          const { data } = await client
            .from("personal_details")
            .select("current_step")
            .eq("user_id", user.id)
            .maybeSingle();
          
          // If current_step is 5 or higher, onboarding is complete - go to dashboard
          // Otherwise, go to the appropriate onboarding step
          if (data && data.current_step >= 5) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding/step-1");
          }
        } catch (err) {
          // If error, default to onboarding step 1
          router.push("/onboarding/step-1");
        }
      };
      
      checkOnboarding();
    }
  }, [user, loading, router]);

  if (!loading && user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {loading ? <h1>Loading...</h1> : <Auth />}
    </div>
  );
}
