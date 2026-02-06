"use client";

import React, { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import Logo from "../../../../public/images/svg/plans-logo.svg";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const PrivatePagesLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path) => pathname === path;
  const [currentStep, setCurrentStep] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const steps = useMemo(
    () => [
      { href: "/onboarding/step-1", label: "Personal Information", step: 1 },
      { href: "/onboarding/step-2", label: "Lifestyle", step: 2 },
      { href: "/onboarding/step-3", label: "Medical History", step: 3 },
      { href: "/onboarding/step-4", label: "Financial", step: 4 },
    ],
    []
  );

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.id) return;
    const loadCurrentStep = async () => {
      const { data, error } = await supabase
        .from("personal_details")
        .select("current_step, completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching current_step:", error);
        setCurrentStep(null);
        setOnboardingCompleted(false);
        return;
      }

      setCurrentStep(data?.current_step ?? 1);
      setOnboardingCompleted(!!data?.completed);
    };

    loadCurrentStep();
  }, [user?.id, pathname]);

  useEffect(() => {
    if (typeof currentStep !== "number") return;
    if (!pathname?.startsWith("/onboarding/step-")) return;

    const match = pathname.match(/\/onboarding\/step-(\d+)/);
    const stepNum = match ? Number(match[1]) : NaN;
    if (!Number.isFinite(stepNum)) return;

    if (stepNum > currentStep + 1) {
      router.replace(`/onboarding/step-${currentStep}`);
    }
  }, [currentStep, pathname, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full max-w-360 mx-auto">
      <div className="bg-sidebar px-8 py-4 w-full max-w-100">
        <Image src={Logo} alt="logo" width={78} height={32} />
        <h2 className="font-semibold text-2xl tracking-4 leading-6 pt-24 text-sidebar-accent-foreground font-sans">
          Setting Up Your Personalized Risk Coverage
        </h2>
        <div className="flex flex-col pt-8 gap-y-6">
          {steps.map((s) => {
            const active = isActive(s.href);
            const stepIndex = s.step;

            // Step is considered completed if it's before the current step,
            // or if onboarding is fully completed.
            const isStepCompleted =
              onboardingCompleted ||
              (typeof currentStep === "number" ? stepIndex < currentStep : false);

            // User can navigate up to the current step (and all steps once completed)
            const canNavigate =
              typeof currentStep === "number"
                ? onboardingCompleted || stepIndex <= currentStep
                : true;

            // Show tick for active or completed steps
            const showTick = active || isStepCompleted;

            // Highlight logic:
            // - If onboarding is completed OR on step 5: all steps are orange
            // - Else: current step AND completed steps (stepIndex < currentStep) are orange
            const isCurrentStep = typeof currentStep === "number" && stepIndex === currentStep;
            const isCompletedStep = typeof currentStep === "number" && stepIndex < currentStep;
            const isOnStep5 = pathname === "/onboarding/step-5";
            const highlight = onboardingCompleted || isOnStep5 || isCurrentStep || isCompletedStep;

            return canNavigate ? (
              <Link
                key={s.href}
                href={s.href}
                className={`text-lg tracking-4 leading-6 flex gap-x-3 items-center font-sans ${
                  highlight ? "text-orange-500 font-semibold" : "font-regular text-sidebar-foreground"
                }`}
              >
                {showTick ? (
                  <Check className={`size-5 ${highlight ? "text-orange-500" : "text-sidebar-foreground"}`} />
                ) : (
                  <span className="size-5" />
                )}
                {s.label}
              </Link>
            ) : (
              <div
                key={s.href}
                className="text-lg tracking-4 leading-6 flex gap-x-3 items-center text-sidebar-foreground opacity-50 cursor-not-allowed"
              >
                <span className="size-5" />
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default PrivatePagesLayout;
