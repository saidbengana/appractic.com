import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PaginationProps {
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
  }
  links: {
    first: string | null
    last: string | null
    next: string | null
    prev: string | null
  }
}

export function Pagination({ meta, links }: PaginationProps) {
  const linkClass = "px-3 py-1 rounded-md leading-4"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {links.prev && (
          <Link
            href={links.prev}
            className={cn(
              linkClass,
              "hover:bg-gray-100 transition-colors duration-200"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}

        {meta.links.map((link, index) => {
          if (!link.url) return null

          return (
            <Link
              key={index}
              href={link.url}
              className={cn(linkClass, {
                "bg-indigo-50 text-indigo-600": link.active,
                "hover:bg-gray-100 transition-colors duration-200": !link.active,
              })}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          )
        })}

        {links.next && (
          <Link
            href={links.next}
            className={cn(
              linkClass,
              "hover:bg-gray-100 transition-colors duration-200"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{meta.from}</span> to{" "}
        <span className="font-medium">{meta.to}</span> of{" "}
        <span className="font-medium">{meta.total}</span> results
      </div>
    </div>
  )
}
