"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AlertProps = React.HTMLAttributes<HTMLDivElement>;

export function Alert({ className, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn("flex items-start gap-3 rounded-md border p-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <p
      data-slot="alert-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

export default Alert;
