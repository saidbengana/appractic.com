import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  Moon,
  Sun,
  Laptop,
  Languages,
  Shield,
  Key,
  Mail,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import Link from "next/link"

interface UserMenuProps {
  /** Additional class name for the trigger */
  className?: string
  /** Whether to show the theme switcher */
  showThemeSwitcher?: boolean
  /** Whether to show the language switcher */
  showLanguageSwitcher?: boolean
  /** Available languages */
  languages?: { code: string; name: string }[]
  /** Current language */
  currentLanguage?: string
  /** Callback when language changes */
  onLanguageChange?: (code: string) => void
  /** Whether to show notifications */
  showNotifications?: boolean
  /** Number of unread notifications */
  unreadNotifications?: number
  /** Custom trigger element */
  trigger?: React.ReactNode
  /** Additional menu items */
  additionalItems?: React.ReactNode
}

export function UserMenu({
  className,
  showThemeSwitcher = true,
  showLanguageSwitcher = false,
  languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
  ],
  currentLanguage = "en",
  onLanguageChange,
  showNotifications = true,
  unreadNotifications = 0,
  trigger,
  additionalItems,
}: UserMenuProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  const userInitials = React.useMemo(() => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }, [user.name])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className={cn(
              "relative h-10 w-full flex items-center gap-2 px-2",
              className
            )}
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{user.name}</span>
              {user.role && (
                <span className="text-xs text-muted-foreground">
                  {user.role}
                </span>
              )}
            </div>
            {showNotifications && unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          {showNotifications && (
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {showThemeSwitcher && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                {theme === "system" && <Laptop className="mr-2 h-4 w-4" />}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          {showLanguageSwitcher && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => onLanguageChange?.(lang.code)}
                    >
                      <span>{lang.name}</span>
                      {currentLanguage === lang.code && (
                        <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/api-keys" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              <span>API Keys</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {additionalItems && (
          <>
            <DropdownMenuSeparator />
            {additionalItems}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
