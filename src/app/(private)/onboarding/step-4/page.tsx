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
import { Checkbox } from "@/components/ui/checkbox";

export default function Step4() {
  const router = useRouter();
  const [data, setData] = useState<{
    has_insurance: boolean | null;
    insurance_type: string[];
    insurance_beneficiary: string;
    monthly_income: string;
  }>({
    has_insurance: false,
    insurance_type: [],
    insurance_beneficiary: "myself",
    monthly_income: "20k-40k",
  });
  const [saving, setSaving] = useState(false);

  const isValid =
    data.has_insurance !== null &&
    // If user has insurance, they must select at least one type
    (data.has_insurance === false || (data.has_insurance === true && data.insurance_type.length > 0)) &&
    Boolean(data.insurance_beneficiary) &&
    Boolean(data.monthly_income);

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
      // Convert insurance_type array to string (comma-separated) for database storage
      // Handle empty arrays properly - save as empty string, not "[]"
      let insuranceTypeString = "";
      if (Array.isArray(data.insurance_type)) {
        insuranceTypeString = data.insurance_type.length > 0 
          ? data.insurance_type.join(",") 
          : ""; // Empty array = empty string
      } else if (typeof data.insurance_type === "string") {
        // If it's already a string, use it (but clean up if it's "[]")
        insuranceTypeString = data.insurance_type === "[]" ? "" : data.insurance_type;
      }
      
      const dataToSave = {
        has_insurance: data.has_insurance,
        insurance_type: insuranceTypeString, // Always a string, never "[]"
        insurance_beneficiary: data.insurance_beneficiary,
        monthly_income: data.monthly_income,
      };
      
      console.log("Saving Step 4 data:", {
        original: data,
        converted: dataToSave,
        insurance_type_array: data.insurance_type,
        insurance_type_string: insuranceTypeString,
      });
      
      await saveStep(auth.user.id, 4, dataToSave);
      toast.success("Saved. Completing onboarding...");
      // Mark onboarding as complete by setting current_step to 5
      await supabase
        .from("personal_details")
        .update({ current_step: 5 })
        .eq("user_id", auth.user.id);
      router.replace("/onboarding/step-5");
    } catch (error) {
      console.error("Error saving step 4:", error);
      const errorMessage =
        (error instanceof Error ? error.message : String(error)) ||
        "Failed to save. Please try again.";
      toast.error(errorMessage);
      setSaving(false);
    }
  };

  const toggleInsuranceType = (type: string) => {
    setData((prev) => ({
      ...prev,
      insurance_type: prev.insurance_type.includes(type)
        ? prev.insurance_type.filter((t) => t !== type)
        : [...prev.insurance_type, type],
    }));
  };
  return (
    <div>
      <OnboardingHeader title="Financial" percentCompleted={90} />
      <div className="px-32 py-16 flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-4">
          <Label>Do you currently have any insurance policies?</Label>
          <RadioGroup
            value={data.has_insurance === null ? "" : data.has_insurance ? "yes" : "no"}
            onValueChange={(value) => setData((p) => ({ ...p, has_insurance: value === "yes" }))}
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
          <Label>What types of insurance do you own?</Label>
          <div className="flex gap-x-3">
            <div className="flex gap-x-3">
              <Checkbox
                label="Health"
                checked={data.insurance_type.includes("health")}
                onCheckedChange={() => toggleInsuranceType("health")}
              />
              <Checkbox
                label="Auto"
                checked={data.insurance_type.includes("auto")}
                onCheckedChange={() => toggleInsuranceType("auto")}
              />
              <Checkbox
                label="Life"
                checked={data.insurance_type.includes("life")}
                onCheckedChange={() => toggleInsuranceType("life")}
              />
              <Checkbox
                label="Home"
                checked={data.insurance_type.includes("home")}
                onCheckedChange={() => toggleInsuranceType("home")}
              />
              <Checkbox
                label="Travel"
                checked={data.insurance_type.includes("travel")}
                onCheckedChange={() => toggleInsuranceType("travel")}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>Are you buying insurance for yourself or family?</Label>
          <RadioGroup
            value={data.insurance_beneficiary}
            onValueChange={(value) => setData((p) => ({ ...p, insurance_beneficiary: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="myself"
              id="myself"
              label="Myself"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="self-family"
              id="self-family"
              label="Self + Family"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="parents"
              id="parents"
              label="Parents"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-y-4">
          <Label>What is your monthly income?</Label>
          <RadioGroup
            value={data.monthly_income}
            onValueChange={(value) => setData((p) => ({ ...p, monthly_income: value }))}
            className="flex gap-x-4"
          >
            <RadioGroupItem
              value="less-than-5K"
              id="less-than-5K"
              label="Less than 5K"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="5K-20K"
              id="5K-20K"
              label="5K - 20K"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="20K-40K"
              id="20K-40K"
              label="20K - 40K"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
            <RadioGroupItem
              value="40K+"
              id="40K+"
              label="40K+"
              labelClassName="w-full border justify-center"
            ></RadioGroupItem>
          </RadioGroup>
        </div>
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>

          <Button onClick={handleContinue} disabled={!isValid || saving}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
