"use client";

import * as React from "react";
import { Root as LabelPrimitive } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const labelVariants = cva(
  "text-secondary-foreground gap-x-2 flex items-center  select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "text-base font-normal tracking-4 leading-normal",
        md: "text-lg font-medium tracking-4 lading-normal",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export interface LabelProps
  extends React.ComponentProps<typeof LabelPrimitive>,
    VariantProps<typeof labelVariants> {}

function Label({ className, size, ...props }: LabelProps) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  );
}

export { Label };
