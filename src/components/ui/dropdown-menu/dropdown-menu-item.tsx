import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"

const baseClasses =
  "flex items-center p-2 w-full first:rounded-t-md last:rounded-b-md text-gray-800 hover:bg-gray-100 transition ease-in-out duration-200"
const iconClasses = "mr-2"

interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  href?: string
  as?: "button" | "a" | "div" | "link"
  linkAs?: string
  linkMethod?: string
  icon?: React.ReactNode
}

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, href, as = "link", linkAs, linkMethod = "get", icon, children, ...props }, ref) => {
  const content = (
    <>
      {icon && <span className={iconClasses}>{icon}</span>}
      {children}
    </>
  )

  if (as === "button") {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(baseClasses, "outline-none focus:outline-none", className)}
        {...props}
      >
        <button type="button" className="w-full text-left">
          {content}
        </button>
      </DropdownMenuPrimitive.Item>
    )
  }

  if (as === "a") {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        <a href={href} className="w-full">
          {content}
        </a>
      </DropdownMenuPrimitive.Item>
    )
  }

  if (as === "div") {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        <div className="w-full">{content}</div>
      </DropdownMenuPrimitive.Item>
    )
  }

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(baseClasses, className)}
      {...props}
    >
      <Link
        href={href || ""}
        as={linkAs}
        className="w-full"
        data-method={linkMethod}
      >
        {content}
      </Link>
    </DropdownMenuPrimitive.Item>
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName
