import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, ChevronLeftIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface PaginationProps {
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
    links: Array<{
      active: boolean
      url: string | null
      label: string
    }>
  }
  links?: {
    first: string | null
    last: string | null
    next: string | null
    prev: string | null
  }
  className?: string
}

const linkClass = 'px-3 py-2 rounded-md leading-4'

export function Pagination({ meta, links, className }: PaginationProps) {
  const formattedLinks = useMemo(() => {
    return meta.links.map((link) => {
      const label = link.label.replace('&laquo; ', '').replace(' &raquo;', '')
      
      return {
        active: link.active,
        url: link.url,
        label,
        icon: isNaN(parseInt(label)) ? {
          'Next': ChevronRightIcon,
          'Previous': ChevronLeftIcon
        }[label] : null
      }
    })
  }, [meta.links])

  return (
    <div className={cn("bg-white border border-gray-100 rounded-lg p-3 w-fit", className)}>
      <div className="flex flex-wrap items-center space-x-1">
        {formattedLinks.map((link, index) => {
          const Icon = link.icon

          if (!link.url) {
            return (
              <span
                key={index}
                className={cn(
                  linkClass,
                  'text-gray-400 cursor-not-allowed',
                  link.active && 'bg-indigo-50 text-indigo-600'
                )}
              >
                {Icon ? <Icon className="w-4 h-4" /> : link.label}
              </span>
            )
          }

          return (
            <Link
              key={index}
              href={link.url}
              className={cn(
                linkClass,
                'hover:bg-gray-100',
                link.active && 'bg-indigo-50 text-indigo-600'
              )}
            >
              {Icon ? <Icon className="w-4 h-4" /> : link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
