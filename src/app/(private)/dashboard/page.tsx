"use client";
import { Button } from "@/components/ui/button";
import { CarFront, Hospital, House, LifeBuoy, PlaneTakeoff, PlusIcon } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

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
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch policies from API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/policies");

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
    };

    fetchPolicies();
  }, []);

  const policies: Policy[] = useMemo(() => {
    return apiData?.endpoints?.policies?.getAllPolicies?.response ?? [];
  }, [apiData]);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between w-full items-center">
        <h3 className="font-medium text-3xl leading-8 tracking-4">My Policies</h3>

        <Button className="gap-0.5">
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
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                fetch("/api/policies")
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Retry - Full API data:", data);
                    setApiData(data);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                  });
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && policies.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No policies found.</p>
            <Button className="gap-0.5">
              <PlusIcon className="size-5" /> Add Your First Policy
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && policies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <Card
              key={policy.policyId}
              className={`bg-white ${policy.type === "Health" ? "bg-[linear-gradient(180deg,#F5F0FF_0%,#FFFFFF_60%)]" : policy.type === "Auto" ? "bg-[linear-gradient(180deg,#FCEFFF_0%,#FFFFFF_100%)]" : policy.type === "Life" ? "bg-red-500" : policy.type === "Travel" ? "bg-yellow-500" : policy.type === "Home" ? "bg-[linear-gradient(180deg,#FFF4E5_0%,#FFFFFF_100%)]" : "bg-gray-500"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1.5">
                    <div className="flex gap-x-1 items-center">
                      {policy.type === "Health" ? (
                        <Hospital className="size-5 min-w-5 text-[#8E51FF]" />
                      ) : policy.type === "Auto" ? (
                        <CarFront className="size-5 min-w-5 text-[#E12AFB]" />
                      ) : policy.type === "Life" ? (
                        <LifeBuoy className="size-5 min-w-5 text-[#FE9A00]" />
                      ) : policy.type === "Travel" ? (
                        <PlaneTakeoff className="size-5 min-w-5 text-[#FE9A00]" />
                      ) : policy.type === "Home" ? (
                        <House className="size-5 min-w-5 text-[#FE9A00]" />
                      ) : null}
                      <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">{policy.type}</span>
                    </div>
                    <div className="size-1 rounded-full bg-[#757575]"></div>
                    <span className="text-base font-medium leading-5 tracking-4 text-accent-foreground">{policy.status}</span>
                  </div>
                  <span className="text-base font-medium leading-5 tracking-4 text-muted-foreground">
                    {policy.policyId}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                        <span className="font-medium text-xl leading-6 tracking-4 text-accent-foreground">{policy.provider}</span>
                        <span className="text-muted-foreground text-base font-medium leading-6 tracking-4">Coverage:&nbsp;{policy.coverage}</span>
                    </div>
                    <div className="p-0.5 bg-white rounded-lg">
                      <Image
                        src={
                          policy.providerLogo ||
                          "https://mockmind-api.uifaces.co/content/human/80.jpg"
                        }
                        alt={`${policy.provider}`}
                        width={44}
                        height={44}
                        className="object-contain rounded-md overflow-hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex   text-sm flex-col">
                    <span className="text-muted-foreground text-base font-medium leading-5 tracking-4">Premium</span>
                    <span className="text-accent-foreground text-lg font-medium leading-6 tracking-4">{policy.premium}</span>
                  </div>
                  <div className="flex   text-sm flex-col">
                    <span className="text-muted-foreground">Claims Amt</span>
                    <span className="font-medium">{policy.claimAmount}</span>
                  </div>
                  <div className="flex  text-sm flex-col">
                    <span className="text-muted-foreground">Members</span>
                    <AvatarGroup max={3} size="md">
                      {policy.members.map((member, index) => (
                        <Avatar key={index} size="md">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </div>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Progress
                    value={Math.max(0, Math.min(100, 100 - policy.daysLeft))}
                    className={
                      policy.type === "Health"
                        ? "**:data-[slot=progress-indicator]:bg-[#8E51FF]"
                        : policy.type === "Auto"
                          ? "**:data-[slot=progress-indicator]:bg-[#E12AFB]"
                          : policy.type === "Life"
                            ? "**:data-[slot=progress-indicator]:bg-[#FE9A00]"
                            : policy.type === "Travel"
                              ? "**:data-[slot=progress-indicator]:bg-[#FE9A00]"
                              : policy.type === "Home"
                                ? "**:data-[slot=progress-indicator]:bg-[#FE9A00]"
                                : "**:data-[slot=progress-indicator]:bg-gray-500"
                    }
                  />
                  <Button variant="outline">{policy.daysLeft} days left</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
