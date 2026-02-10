"use client";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PlusIcon,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { DropdownNavProps, DropdownProps } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import PolicyCard from "@/components/common/PolicyCard";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };
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
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>Enter Policy Details Manually</DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Policy Number</FieldLabel>
              <Input type="text" placeholder="Enter Policy Number" />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldLabel>Policy Type</FieldLabel>
              <Select>
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
              <FieldLabel>Date of Birth</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    <span className={cn("truncate", !date && "text-muted-foreground")}>
                      {date ? format(date, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon
                      size={16}
                      className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="border-0 p-0 shadow-none" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={setDate}
                    captionLayout="dropdown"
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return (
                          <div className="flex z-10 relative  items-center gap-2">
                            {props.children}
                          </div>
                        );
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange);
                              }
                            }}
                          >
                            <SelectTrigger className=" font-medium first:grow" variant="outline">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>
        </DialogContent>
      </Dialog>
      <div className="w-full space-y-6">
        <div className="flex justify-between w-full items-center">
          <h3 className="font-medium text-3xl leading-8 tracking-4">My Policies</h3>
          <Button className="gap-0.5" onClick={() => setIsModalOpen(true)}>
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
              <Button className="gap-0.5" onClick={() => setIsModalOpen(true)}>
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
