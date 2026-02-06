import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import client from "@/api/client";
import { toast } from "sonner";

const Signup = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    avatar: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const clearErrors = () => {
    setErrors({
      name: "",
      avatar: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleGitHubSignup = async () => {
    setGithubLoading(true);
    try {
      // For Supabase OAuth, redirectTo is where Supabase redirects AFTER handling the OAuth callback
      // The GitHub OAuth app must have Supabase's callback URL registered: https://<project-ref>.supabase.co/auth/v1/callback
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) {
        console.error(error);
        toast.error(error.message || "GitHub signup failed");
        setGithubLoading(false);
      }
      // Note: If successful, user will be redirected to GitHub, then back to Supabase, then to /dashboard
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setGithubLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const validateAvatarForSignup = (file) => {
    if (!file.type?.startsWith("image/")) return "Please select a valid image file";
    // localStorage-based pending upload: keep small to avoid storage limits
    const maxBytes = 900 * 1024; // ~900KB
    if (file.size > maxBytes) return "Image must be smaller than 900KB";
    return "";
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearErrors();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    // 🔹 Basic validation
    if (!name || !email || !password || !confirmPassword) {
      if (!name) {
        setErrors((prev) => ({ ...prev, name: "Name is required" }));
      }
      if (!email) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      }
      if (!password) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
      }
      if (!confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Please confirm your password",
        }));
      }
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      setLoading(false);
      return;
    }

    try {
      if (avatarFile) {
        const avatarErr = validateAvatarForSignup(avatarFile);
        if (avatarErr) {
          setErrors((prev) => ({ ...prev, avatar: avatarErr }));
          setLoading(false);
          return;
        }
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error(error);

        // Parse error message to determine which field has the error
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("email") || errorMessage.includes("user")) {
          setErrors((prev) => ({ ...prev, email: error.message }));
        } else if (errorMessage.includes("password")) {
          setErrors((prev) => ({ ...prev, password: error.message }));
        } else {
          // If we can't determine the field, show on email as default
          setErrors((prev) => ({ ...prev, email: error.message }));
        }

        setLoading(false);
        return;
      }

      // Create initial personal_details record for new user
      if (data?.user?.id) {
        try {
          const { error: dbError } = await client
            .from("personal_details")
            .insert({
              user_id: data.user.id,
              current_step: 1,
              completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (dbError) {
            console.error("Error creating user profile:", dbError);
            // Log detailed error for debugging
            console.error("Database error details:", {
              message: dbError.message,
              code: dbError.code,
              details: dbError.details,
              hint: dbError.hint,
            });
            // Don't fail signup if profile creation fails - user can still login
            // The profile will be created on first login or onboarding step
            toast.warning("Account created, but profile setup may be delayed. You can still log in.");
          }
        } catch (dbErr) {
          console.error("Error creating user profile:", dbErr);
          // Don't fail signup if profile creation fails
          toast.warning("Account created, but profile setup may be delayed. You can still log in.");
        }
      }

      // If user selected an avatar, store it locally and upload after the first successful login.
      // Reason: when email confirmation is enabled, signUp() may not return an auth session yet.
      if (avatarFile && data?.user?.id) {
        try {
          const dataUrl = await fileToDataUrl(avatarFile);
          localStorage.setItem(
            "pendingAvatarUpload",
            JSON.stringify({
              userId: data.user.id,
              dataUrl,
              contentType: avatarFile.type,
            }),
          );
        } catch (err) {
          console.error(err);
        }
      }

      toast.success("Account created successfully. Please check your email to verify.");
      clearErrors();
      setAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl("");
      setLoading(false);
      onSwitchToLogin?.();
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        email: "Something went wrong. Please try again.",
      }));
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                status={errors.name ? "error" : "default"}
                aria-invalid={!!errors.name}
                onChange={() => {
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

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
              {errors.email ? (
                <FieldError>{errors.email}</FieldError>
              ) : (
                <FieldDescription>We&apos;ll never share your email.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                status={errors.password ? "error" : "default"}
                aria-invalid={!!errors.password}
                onChange={() => {
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
              />
              {errors.password ? (
                <FieldError>{errors.password}</FieldError>
              ) : (
                <FieldDescription>Must be at least 6 characters.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="********"
                required
                status={errors.confirmPassword ? "error" : "default"}
                aria-invalid={!!errors.confirmPassword}
                onChange={() => {
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
              />
              {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
            </Field>

            <FieldGroup>
              <Field className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={githubLoading || loading}
                  onClick={handleGitHubSignup}
                >
                  {githubLoading ? "Redirecting to GitHub..." : "Sign up with GitHub"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default Signup;
