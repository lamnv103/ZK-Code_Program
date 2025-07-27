"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, Menu, Home, History, Send, Info, User, X, Settings, Wallet, LogOut, Eye, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { name: "Trang chủ", href: "/", icon: Home },
  { name: "Xem số dư", href: "/balance", icon: Eye },
  { name: "Nạp tiền", href: "/deposit", icon: Wallet },
  { name: "Chuyển tiền", href: "/transfer", icon: Send },
  { name: "Lịch sử giao dịch", href: "/history", icon: History },
  { name: "Giải thích bảo mật", href: "/security", icon: Info },
]

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Settings },
  { name: "Quản lý ZKP", href: "/admin/zkp", icon: Shield },
  { name: "Quản lý giao dịch", href: "/admin/transactions", icon: History },
  { name: "Quản lý người dùng", href: "/admin/users", icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const isAdminPage = pathname.startsWith("/admin")

  const currentNavigation = isAdminPage ? adminNavigation : navigation

  const handleLogout = () => {
    logout()
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống",
    })
    router.push("/")
  }

  const getUserDisplayName = () => {
    if (!user) return ""
    return user.name || user.email.split("@")[0]
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.name || user.email
    return name.charAt(0).toUpperCase()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              zkTransfer {isAdminPage && <span className="text-sm text-muted-foreground">Admin</span>}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {currentNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    {/* User Info - Desktop */}
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Xin chào,</span>
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    </div>

                    {/* User Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.walletAddress.substring(0, 10)}...
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href="/balance" className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Xem số dư</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex items-center">
                            <Key className="mr-2 h-4 w-4" />
                            <span>Đổi mã PIN</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {!isAdminPage ? (
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center">
                              <Home className="mr-2 h-4 w-4" />
                              <span>User Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Đăng xuất</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/auth/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Link href="/auth/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="flex flex-col space-y-1 px-4 py-4">
              {/* User Info - Mobile */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3 px-3 py-2 mb-2 bg-muted rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {currentNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Mobile Auth Actions */}
              {isAuthenticated ? (
                <>
                  <div className="border-t pt-2 mt-2">
                    <Link
                      href="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Key className="w-4 h-4" />
                      <span>Đổi mã PIN</span>
                    </Link>

                    {!isAdminPage ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Home className="w-4 h-4" />
                        <span>User Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <User className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <User className="w-4 h-4" />
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
