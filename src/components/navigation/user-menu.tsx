import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Dropdown } from '@/components/ui/dropdown'
import { DropdownItem } from '@/components/ui/dropdown-item'
import { UserCircleIcon, PencilSquareIcon, ArrowRightOnRectangleIcon } from '@/components/icons'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export function UserMenu() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dropdown 
      open={isOpen} 
      onOpenChange={setIsOpen}
      align="end"
      width="w-64"
    >
      <Dropdown.Trigger>
        <button className="w-full flex items-center">
          <div className="mr-3">
            <UserCircleIcon className="w-9 h-9 text-gray-400" />
          </div>
          <div className="w-[calc(100%-3rem)]">
            <div className="truncate">{user?.name}</div>
          </div>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content>
        <DropdownItem asChild>
          <Link href="/profile" className="flex items-center">
            <PencilSquareIcon className="w-4 h-4 mr-2" />
            Edit profile
          </Link>
        </DropdownItem>

        <DropdownItem
          onClick={() => signOut()}
          className="flex items-center"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownItem>
      </Dropdown.Content>
    </Dropdown>
  )
}
