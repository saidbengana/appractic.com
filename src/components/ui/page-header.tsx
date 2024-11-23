import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export interface Breadcrumb {
  label: string
  href?: string
}

export interface Action {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
}

export interface PageHeaderProps {
  /** The title of the page */
  title: string
  /** Optional description below the title */
  description?: React.ReactNode
  /** Optional children to render in the header */
  children?: React.ReactNode
  /** Optional breadcrumbs */
  breadcrumbs?: Breadcrumb[]
  /** Optional actions */
  actions?: Action[]
  /** Optional status badge */
  status?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  /** Optional back button */
  backButton?: {
    label?: string
    href?: string
    onClick?: () => void
  }
  /** Optional subtitle */
  subtitle?: string
  /** Optional className */
  className?: string
  /** Optional size */
  size?: "default" | "sm" | "lg"
  /** Optional sticky behavior */
  sticky?: boolean
  /** Optional divider */
  divider?: boolean
  /** Optional centered layout */
  centered?: boolean
}

export function PageHeader({
  title,
  description,
  children,
  breadcrumbs,
  actions,
  status,
  backButton,
  subtitle,
  className,
  size = "default",
  sticky = false,
  divider = false,
  centered = false,
}: PageHeaderProps) {
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "space-y-4",
        sticky && "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        divider && "pb-4 border-b",
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div
        className={cn(
          "flex items-start gap-4",
          centered && "justify-center text-center flex-col items-center",
          size === "sm" && "gap-2",
          size === "lg" && "gap-6"
        )}
      >
        {/* Back Button */}
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 px-2",
              size === "sm" && "text-sm",
              size === "lg" && "text-base"
            )}
            onClick={backButton.onClick}
            {...(backButton.href && { as: "a", href: backButton.href })}
          >
            <ArrowLeft className="h-4 w-4" />
            {backButton.label || "Back"}
          </Button>
        )}

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-4">
            <h1
              className={cn(
                "font-semibold tracking-tight",
                size === "sm" && "text-lg",
                size === "default" && "text-2xl",
                size === "lg" && "text-3xl"
              )}
            >
              {title}
            </h1>
            {status && (
              <Badge variant={status.variant}>{status.label}</Badge>
            )}
          </div>

          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}

          {description && (
            <div
              className={cn(
                "text-muted-foreground",
                size === "sm" && "text-sm",
                size === "default" && "text-base",
                size === "lg" && "text-lg"
              )}
            >
              {description}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                disabled={action.disabled}
                {...(action.href && { as: "a", href: action.href })}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {children}
      </div>

      {divider && <Separator />}
    </motion.header>
  )
}
