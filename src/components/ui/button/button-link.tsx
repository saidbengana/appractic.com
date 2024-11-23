import * as React from "react"
import Link from "next/link"
import { buttonVariants, type ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface ButtonLinkProps extends Omit<ButtonProps, "asChild"> {
  href: string
  external?: boolean
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, href, external = false, children, ...props }, ref) => {
    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(buttonVariants({ variant, size, className }))}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
ButtonLink.displayName = "ButtonLink"

export { ButtonLink }
