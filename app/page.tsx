"use client"

import { useEffect, useState } from "react"
import { Shield, Eye, EyeOff, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface User {
  name: string
  email: string
  walletAddress: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            zkTransfer
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Chuyển tiền với quyền riêng tư tuyệt đối - Ẩn danh số dư, công khai giao dịch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/transfer">Bắt đầu chuyển tiền</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/security">Tìm hiểu ZKP</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <EyeOff className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Số dư ẩn danh</CardTitle>
              <CardDescription>Số dư tài khoản của bạn hoàn toàn bí mật, không ai có thể xem được</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Giao dịch minh bạch</CardTitle>
              <CardDescription>
                Số tiền chuyển và địa chỉ người nhận được công khai để đảm bảo minh bạch
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Zero-Knowledge Proof</CardTitle>
              <CardDescription>Chứng minh bạn có đủ tiền mà không cần tiết lộ số dư thực tế</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Account Status */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Trạng thái tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Tên người dùng:</span>
                <span className="font-semibold">{user?.name || "Chưa đăng nhập"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Địa chỉ ví:</span>
                <code className="bg-white px-2 py-1 rounded text-sm">
                  {user?.walletAddress || "Không có"}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span>Số dư:</span>
                <span className="text-muted-foreground">[Không hiển thị]</span>
              </div>
              {user && (
                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">✅ Bạn đủ điều kiện chuyển tiền.</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Xác nhận bằng ZKP: bạn có đủ số dư nhưng không tiết lộ số dư thực.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}