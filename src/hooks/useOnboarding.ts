/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabase/client";

export async function saveStep(userId: string, step: number, values: Record<string, any>) {
  // Ensure we have a session before making the request
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No active session. Please log in again.");
  }

  const payload = {
    user_id: userId,
    ...values,
    current_step: step + 1,
    updated_at: new Date().toISOString(),
  };

  // Log payload for debugging (remove in production)
  if (step === 4) {
    console.log("saveStep payload for step 4:", payload);
  }

  const { error } = await supabase.from("personal_details").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    // Supabase errors often don't show up well in Next overlay; log structured details.
    console.error("Error saving step (personal_details upsert) =>", {
      message: (error as any)?.message,
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      payload,
      raw: error,
    });
    throw error;
  }
}
