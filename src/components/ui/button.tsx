
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 rounded-xl min-h-[52px] px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98]",
        outline: "btn-secondary",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 rounded-xl min-h-[52px] px-6 py-3 shadow-sm hover:shadow-md active:scale-[0.98]",
        ghost: "btn-ghost",
        link: "text-blue-500 underline-offset-4 hover:underline min-h-[44px] px-4 py-2 rounded-lg",
      },
      size: {
        default: "min-h-[52px] px-6 py-3",
        sm: "min-h-[44px] px-4 py-2 text-sm rounded-lg",
        lg: "min-h-[56px] px-8 py-4 text-lg rounded-xl",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
