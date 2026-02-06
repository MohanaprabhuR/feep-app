"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { saveStep } from "@/hooks/useOnboarding";
import OnboardingHeader from "@/components/onboarding/onboarding-header";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Step2() {
  const router = useRouter();
  const [data, setData] = useState<{
    smoking: boolean | null;
    consume_alcohol: string;
    exercise_frequency: string;
    stress_level: string;
  }>({
    smoking: false,
    consume_alcohol: "never",
    exercise_frequency: "never",
    stress_level: "low",
  });
  const [saving, setSaving] = useState(false);

  const isValid = 
    data.smoking !== null && 
    Boolean(data.consume_alcohol) && 
    Boolean(data.exercise_frequency) && 
    Boolean(data.stress_level);

  const handleContinue = async () => {
    if (!isValid) return;
    if (saving) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please log in again.");
      setSaving(false);
      return;
    }

    try {
      await saveStep(auth.user.id, 2, data);
      toast.success("Saved. Moving to Step 3...");
      router.replace("/onboarding/step-3");
    } catch (error) {
      console.error("Error saving step 2:", error);
      const errorMessage = 
        (error instanceof Error ? error.message : String(error)) || 
        "Failed to save. Please try again.";
      toast.error(errorMessage);
      setSaving(false);
    }
  };

  return (
    <div>
      <OnboardingHeader
        title="Lifestyle"
        percentCompleted={35}
      />
      <div className="px-32 py-16 flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-4">
          <Label>Do you smoke?</Label>
          <RadioGroup
            value={data.smoking === null ? "" : data.smoking ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, smoking: value === "yes" }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="yes"
              id="yes"
              label="Yes"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="no"
              id="no"
              label="No"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>Do you consume alcohol?</Label>
          <RadioGroup
            value={data.consume_alcohol}
            onValueChange={(value) => setData((p) => ({ ...p, consume_alcohol: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="never"
              id="never"
              label="Never"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="regularly"
              id="regularly"
              label="Regularly"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="occasionally"
              id="occasionally"
              label="Occasionally"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>How often do you exercise intentionally?</Label>
          <RadioGroup
            value={data.exercise_frequency}
            onValueChange={(value) => setData((p) => ({ ...p, exercise_frequency: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="never"
              id="never"
              label="Never"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="1-2-times"
              id="1-2-times"
              label="1-2 Times"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="3-4-times"
              id="3-4-times"
              label="3-4 Times"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="daily"
              id="daily"
              label="Daily"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>How would you describe your stress level?</Label>
          <RadioGroup
             value={data.stress_level}
             onValueChange={(value) => setData((p) => ({ ...p, stress_level: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="low"
              id="low"
              label="Low"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="moderate"
              id="moderate"
              label="Moderate"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="high"
              id="high"
              label="High"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>

          <Button onClick={handleContinue} disabled={!isValid || saving}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
