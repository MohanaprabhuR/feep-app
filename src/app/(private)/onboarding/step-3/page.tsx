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

export default function Step3() {
  const router = useRouter();
  const [data, setData] = useState<{
    has_medical_conditions: boolean | null;
    known_medical_conditions: string;
    hospitalized_last_5_years: boolean | null;
    takes_regular_medication: boolean | null;
  }>({
    has_medical_conditions: false,
    known_medical_conditions: "none",
    hospitalized_last_5_years: false,
    takes_regular_medication: false,
  });
  const [saving, setSaving] = useState(false);

  const isValid = 
    data.has_medical_conditions !== null &&
    Boolean(data.known_medical_conditions) &&
    data.hospitalized_last_5_years !== null &&
    data.takes_regular_medication !== null;

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
      await saveStep(auth.user.id, 3, data);
      toast.success("Saved. Moving to Step 4...");
      router.replace("/onboarding/step-4");
    } catch (error) {
      console.error("Error saving step 3:", error);
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
        title="Medical History"
        percentCompleted={70}
      />
      <div className="px-32 py-16 flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-4">
          <Label>Do you have any pre-existing medical conditions?</Label>
          <RadioGroup
            value={data.has_medical_conditions === null ? "" : data.has_medical_conditions ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, has_medical_conditions: value === "yes" }))}
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
          <Label>Any known medical conditions?</Label>
          <RadioGroup
            value={data.known_medical_conditions}
            onValueChange={(value) => setData((p) => ({ ...p, known_medical_conditions: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="diabetes"
              id="diabetes"
              label="Diabetes"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="hypertension"
              id="hypertension"
              label="Hypertension"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="heart-issues"
              id="heart-issues"
              label="Heart issues"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
             <RadioGroupItem
              value="none"
              id="none"
              label="None"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>Have you been hospitalized in the past 5 years?</Label>
          <RadioGroup
            value={data.hospitalized_last_5_years === null ? "" : data.hospitalized_last_5_years ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, hospitalized_last_5_years: value === "yes" }))}
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
          <Label>Do you take any regular medications?</Label>
          <RadioGroup
            value={data.takes_regular_medication === null ? "" : data.takes_regular_medication ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, takes_regular_medication: value === "yes" }))}
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
