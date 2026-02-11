"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PolicyCard from "@/components/common/PolicyCard";
import useAuth from "@/hooks/useAuth";

interface Policy {
  policyId: string;
  type: string;
  status: string;
  provider: string;
  providerLogo: string;
  coverage: string;
  premium: string;
  claimAmount: string;
  members: Array<{ name: string; avatar: string }>;
  daysLeft: number;
  renewalDate: string;
}

interface ApiResponse {
  endpoints: {
    policies: {
      getAllPolicies: {
        response: Policy[];
      };
    };
  };
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyId, setPolicyId] = useState("");
  const generatePolicyId = () => {
    const digits = Math.floor(Math.random() * 10 ** 10)
      .toString()
      .padStart(10, "0");
    return `#${digits}`;
  };
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    policyId: "",
    policyName: "",
    policyStatus: "",
    policyProvider: "",
    policyCoverage: "",
    policyPremium: "",
    policyClaimAmount: "",
    policyDaysLeft: "",
    policyMembers: "",
  });

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      const newId = generatePolicyId();
      setPolicyId(newId);
      setFormData((prev) => ({ ...prev, policyId: newId }));
    }
  };

  const fetchPolicies = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/policies", {
        cache: "no-store",
        headers: { "X-User-Id": user.id },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch policies: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = await response.json();
      setApiData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(`Failed to load policies: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch policies from API (per user)
  useEffect(() => {
    if (user?.id) fetchPolicies();
  }, [user?.id, fetchPolicies]);

  const policies: Policy[] = useMemo(() => {
    return apiData?.endpoints?.policies?.getAllPolicies?.response ?? [];
  }, [apiData]);

  const handleAddPolicy = async () => {
    if (submitting) return;
    if (!user?.id) {
      toast.error("You must be logged in to add a policy.");
      return;
    }
    setSubmitting(true);
    try {
      if (!policyId || !formData.policyName || !formData.policyStatus || !formData.policyProvider) {
        toast.error("Please fill Policy Name, Status, and Provider.");
        return;
      }

      const daysLeftNum = Number(formData.policyDaysLeft || 0) || 0;

      const members = (formData.policyMembers || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          name,
          avatar: `https://mockmind-api.uifaces.co/content/human/${80 + i}.jpg`,
        }));

      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.id ?? "",
        },
        body: JSON.stringify({
          policyId,
          type: formData.policyName,
          status: formData.policyStatus,
          provider: formData.policyProvider,
          coverage: formData.policyCoverage,
          premium: formData.policyPremium,
          claimAmount: formData.policyClaimAmount,
          daysLeft: daysLeftNum,
          members,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to add policy");
      }

      toast.success("Policy added");
      handleModalOpenChange(false);
      await fetchPolicies();
    } catch (error) {
      console.error("Error adding policy:", error);
      toast.error("Failed to add policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>Enter Policy Details Manually</DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Policy Id</FieldLabel>
              <Input
                type="text"
                placeholder="Enter Policy Id"
                value={policyId}
                onChange={(e) => {
                  setPolicyId(e.target.value);
                  setFormData((p) => ({ ...p, policyId: e.target.value }));
                }}
              />
            </Field>
          </FieldGroup>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Name</FieldLabel>
                <Select
                  value={formData.policyName}
                  onValueChange={(v) => setFormData((p) => ({ ...p, policyName: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Policy Type" />
                    <SelectContent>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Life">Life</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Status</FieldLabel>
                <Select
                  value={formData.policyStatus}
                  onValueChange={(v) => setFormData((p) => ({ ...p, policyStatus: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Policy Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Provider</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Provider"
                  value={formData.policyProvider}
                  onChange={(e) => setFormData((p) => ({ ...p, policyProvider: e.target.value }))}
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Coverage</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Coverage"
                  value={formData.policyCoverage}
                  onChange={(e) => setFormData((p) => ({ ...p, policyCoverage: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>
          <div className="flex gap-x-4 items-center">
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Premium</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Premium"
                  value={formData.policyPremium}
                  onChange={(e) => setFormData((p) => ({ ...p, policyPremium: e.target.value }))}
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Claim Amount</FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter Policy Claim Amount"
                  value={formData.policyClaimAmount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, policyClaimAmount: e.target.value }))
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel>Policy Days Left</FieldLabel>
                <Input
                  type="number"
                  placeholder="Enter Policy Days Left"
                  value={formData.policyDaysLeft}
                  onChange={(e) => setFormData((p) => ({ ...p, policyDaysLeft: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel>Policy Members</FieldLabel>
              <Input
                type="text"
                placeholder="Enter Policy Members (comma separated)"
                value={formData.policyMembers}
                onChange={(e) => setFormData((p) => ({ ...p, policyMembers: e.target.value }))}
              />
            </Field>
          </FieldGroup>
          <Button
            type="button"
            className="justify-self-end"
            onClick={handleAddPolicy}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Policy"}
          </Button>
        </DialogContent>
      </Dialog>
      <div className="w-full space-y-6">
        <div className="flex justify-between w-full items-center">
          <h3 className="font-medium text-3xl leading-8 tracking-4">My Policies</h3>
          <Button className="gap-0.5" onClick={() => handleModalOpenChange(true)}>
            <PlusIcon className="size-5" /> Add
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading policies...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">Error: {error}</p>
              <Button variant="outline" onClick={() => { setError(null); fetchPolicies(); }}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && policies.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No policies found.</p>
              <Button className="gap-0.5" onClick={() => handleModalOpenChange(true)}>
                <PlusIcon className="size-5" /> Add Your First Policy
              </Button>
            </div>
          </div>
        )}
        {!loading && !error && policies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => (
              <PolicyCard key={policy.policyId} policy={policy} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
