"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-gray-200 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:border-gray-600 dark:data-[state=unchecked]:bg-gray-700 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:opacity-100",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 disabled:bg-gray-300",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
