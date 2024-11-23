import * as React from "react"
import { useAppContext } from "@/providers/app-provider"
import { cn } from "@/lib/utils"
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href?: string
  icon?: React.ReactNode
  onClick?: () => void
  badge?: string | number
}

interface NavBarProps {
  /** Logo component or element */
  logo?: React.ReactNode
  /** Navigation items */
  items?: NavItem[]
  /** User information */
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  /** Show search bar */
  showSearch?: boolean
  /** Show notifications */
  showNotifications?: boolean
  /** Custom right content */
  rightContent?: React.ReactNode
  /** Additional class name */
  className?: string
  /** Whether the navbar is sticky */
  sticky?: boolean
  /** Whether to show a border */
  border?: boolean
  /** Whether to show a shadow */
  shadow?: boolean
}

export function NavBar({
  logo,
  items = [],
  user,
  showSearch = true,
  showNotifications = true,
  rightContent,
  className,
  sticky = true,
  border = true,
  shadow = true,
}: NavBarProps) {
  const { showAside, setShowAside } = useAppContext()
  const [searchValue, setSearchValue] = React.useState("")
  const [notifications, setNotifications] = React.useState<NavItem[]>([])

  const toggleAside = () => {
    setShowAside(!showAside)
  }

  return (
    <nav
      className={cn(
        "flex h-16 items-center gap-4 bg-background px-4",
        sticky && "sticky top-0 z-50",
        border && "border-b",
        shadow && "shadow-sm",
        className
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="xl:hidden"
        onClick={toggleAside}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      {logo && (
        <div className="flex items-center gap-2">
          {logo}
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {items.map((item, index) => (
          <Button
            key={item.label}
            variant="ghost"
            asChild={!!item.href}
            onClick={item.onClick}
            className="flex items-center gap-2"
          >
            {item.href ? (
              <a href={item.href}>
                {item.icon}
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1">
                    {item.badge}
                  </Badge>
                )}
              </a>
            ) : (
              <>
                {item.icon}
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Notifications */}
        {showNotifications && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications.length}
                  </Badge>
                )}
                <span className="sr-only">View notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No new notifications
                  </p>
                ) : (
                  <div className="grid gap-4 p-4">
                    {notifications.map((notification, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={notification.onClick}
                      >
                        {notification.icon}
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {notification.label}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  {user.role && (
                    <Badge variant="secondary" className="mt-1 w-fit">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Custom Right Content */}
        {rightContent}
      </div>
    </nav>
  )
}
