import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Dropdown, DropdownContent, DropdownTrigger } from '@/components/ui/dropdown'
import { DropdownItem } from '@/components/ui/dropdown-item'
import { Icons } from '@/components/icons'
import { Pencil, LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'

export function UserMenu() {
  const { user } = useAuth()
  const { signOut } = useClerk()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dropdown 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DropdownTrigger>
        <button className="w-full flex items-center">
          <div className="mr-3">
            <Icons.user className="w-9 h-9 text-gray-400" />
          </div>
          <div className="w-[calc(100%-3rem)]">
            <div className="truncate">{user?.name}</div>
          </div>
        </button>
      </DropdownTrigger>

      <DropdownContent 
        className="w-64"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <DropdownItem asChild>
          <Link href="/profile" className="flex items-center">
            <Pencil className="w-4 h-4 mr-2" />
            Edit profile
          </Link>
        </DropdownItem>

        <DropdownItem
          onClick={() => signOut()}
          className="flex items-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
