"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";

const DashboardPage = () => {
  return (
    <>
      <div className="flex justify-between w-full items-center">
        <h3 className="font-medium text-3xl leading-8 tracking-4">My Policies</h3>
        <Button className="gap-0.5">
          <PlusIcon className="size-5" /> Add
        </Button>
      </div>
    </>
  );
};

export default DashboardPage;
