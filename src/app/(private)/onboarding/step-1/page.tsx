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

export default function Step1() {
  const router = useRouter();
  const [data, setData] = useState({
    gender: "male",
    age_group: "18-35",
    employment_type: "full-time",
    dependents: false,
  });
  const [saving, setSaving] = useState(false);

  const isValid = Boolean(data.gender && data.age_group && data.employment_type);

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
      await saveStep(auth.user.id, 1, data);
      toast.success("Saved. Moving to Step 2...");
      router.push("/onboarding/step-2");
    } catch {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div>
      <OnboardingHeader
        title="Personal Information"
        percentCompleted={10}
      />
      <div className="px-32 py-16 flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-4">
          <Label>What is your gender?</Label>
          <RadioGroup
            value={data.gender}
            onValueChange={(value) => setData((p) => ({ ...p, gender: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="male"
              id="male"
              label="Male"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="female"
              id="female"
              label="female"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>What is your age group?</Label>
          <RadioGroup
            value={data.age_group}
            onValueChange={(value) => setData((p) => ({ ...p, age_group: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="18-35"
              id="18-35"
              label="18-35"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="35-50"
              id="35-50"
              label="35-50"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="50-65"
              id="50-65"
              label="50-65"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="65+"
              id="65+"
              label="65+"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>What is your employment type?</Label>
          <RadioGroup
            value={data.employment_type}
            onValueChange={(value) => setData((p) => ({ ...p, employment_type: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="full-time"
              id="full-time"
              label="Full Time"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="part-time"
              id="part-time"
              label="Part Time"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="self-employed"
              id="self-employed"
              label="Self Employed"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="student"
              id="student"
              label="Student"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>Do you have any dependents?</Label>
          <RadioGroup
            value={data.dependents ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, dependents: value === "yes" }))}
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
        <div className="flex justify-end items-center w-full">
          <Button onClick={handleContinue} disabled={!isValid || saving}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
