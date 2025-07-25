"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, Home, History, Send, Info, User, X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Trang chủ", href: "/", icon: Home },
  { name: "Lịch sử giao dịch", href: "/history", icon: History },
  { name: "Chuyển tiền", href: "/transfer", icon: Send },
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
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isAdminPage = pathname.startsWith("/admin")

  const currentNavigation = isAdminPage ? adminNavigation : navigation

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
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/auth/login"
                      className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Đăng nhập</span>
                    </Link>
                    <div className="border-t my-1"></div>
                    {!isAdminPage ? (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <Link
                        href="/"
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        <span>User Panel</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
