import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

import { DropdownContent } from './dropdown-content'
import { DropdownItem } from './dropdown-item'
import { DropdownLabel } from './dropdown-label'
import { DropdownSeparator } from './dropdown-separator'
import { DropdownSubMenu, DropdownSubMenuTrigger, DropdownSubMenuContent } from './dropdown-submenu'
import { DropdownTrigger } from './dropdown-trigger'

const Dropdown = DropdownMenuPrimitive.Root

export {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownSubMenu,
  DropdownSubMenuTrigger,
  DropdownSubMenuContent,
  DropdownTrigger
}
