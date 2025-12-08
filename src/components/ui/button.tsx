import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium",

        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium",

        outline:
          "border-2 border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200",

        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-md hover:from-slate-200 hover:to-slate-300 hover:shadow-lg dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 transition-all duration-200 font-medium",

        ghost:
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-all duration-200",

        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200",

        success:
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium",

        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium",

        info: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium",

        premium:
          "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-xl shadow-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300 font-semibold bg-size-200 bg-pos-0 hover:bg-pos-100",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
