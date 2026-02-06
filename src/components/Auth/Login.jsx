import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import client from "@/api/client";
import { toast } from "sonner";

const Login = ({ onSwitchToSignup }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const clearErrors = () => {
    setErrors({ email: "", password: "" });
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/onboarding/step-1` : undefined,
        },
      });

      if (error) {
        console.error(error);
        toast.error(error.message || "GitHub login failed");
        setGithubLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setGithubLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearErrors();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    // Basic validation
    if (!email || !password) {
      if (!email) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      }
      if (!password) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
      }
      setLoading(false);
      return;
    }

    // Email format validation
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(error);
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("email") || errorMessage.includes("user")) {
          setErrors((prev) => ({ ...prev, email: error.message }));
        } else if (errorMessage.includes("password") || errorMessage.includes("invalid login")) {
          setErrors((prev) => ({ ...prev, password: error.message }));
        } else {
          setErrors((prev) => ({ ...prev, password: error.message }));
        }

        setLoading(false);
        return;
      }

      // Ensure user has a personal_details record (create if missing)
      if (authData?.user?.id) {
        try {
          const { data: existingProfile } = await client
            .from("personal_details")
            .select("user_id")
            .eq("user_id", authData.user.id)
            .maybeSingle();

          if (!existingProfile) {
            // Create initial record if it doesn't exist
            const { error: dbError } = await client
              .from("personal_details")
              .insert({
                user_id: authData.user.id,
                current_step: 1,
                completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (dbError) {
              console.error("Error creating user profile:", dbError);
              toast.error("Database error saving new user. Please try again.");
              setLoading(false);
              return;
            }
          }
        } catch (dbErr) {
          console.error("Error checking/creating user profile:", dbErr);
          toast.error("Database error saving new user. Please try again.");
          setLoading(false);
          return;
        }
      }

      toast.success("Logged in successfully!");
      clearErrors();
      // Redirect to onboarding step 1
      router.push("/onboarding/step-1");
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, password: "Something went wrong. Please try again." }));
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                status={errors.email ? "error" : "default"}
                aria-invalid={!!errors.email}
                onChange={() => {
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.password}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                status={errors.password ? "error" : "default"}
                aria-invalid={!!errors.password}
                onChange={() => {
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
              />
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>
            <Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={githubLoading || loading}
                onClick={handleGitHubLogin}
              >
                {githubLoading ? "Redirecting to GitHub..." : "Login with GitHub"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="underline underline-offset-4"
                >
                  Sign up
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
