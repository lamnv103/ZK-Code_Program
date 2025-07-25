"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, UserPlus, Wallet } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate registration and wallet creation
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Đăng ký thành công!",
        description: "Ví ZK của bạn đã được tạo tự động và sẵn sàng sử dụng.",
      })
      router.push("/")
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
          <p className="text-muted-foreground">Tạo tài khoản và ví ZK mới</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tạo tài khoản mới</CardTitle>
            <CardDescription>Ví ZK sẽ được tạo tự động khi đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <Wallet className="w-4 h-4" />
                  <span className="font-medium">Tạo ví ZK tự động</span>
                </div>
                <p className="text-green-700 text-xs mt-1">
                  Ví Zero-Knowledge sẽ được tạo và mã hóa an toàn khi bạn đăng ký
                </p>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600" disabled={isLoading}>
                {isLoading ? (
                  "Đang tạo ví ZK..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Đăng ký
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <Shield className="w-4 h-4 inline mr-1" />
            Ví của bạn sẽ được mã hóa với mật khẩu và chỉ bạn mới có thể truy cập.
          </p>
        </div>
      </div>
    </div>
  )
}
