"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PinInput } from "@/components/pin-input"
import { Shield, Eye, EyeOff, Wallet, TrendingUp, History, ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface BalanceData {
  balance: string
  walletAddress: string
  lastUpdated: string
  stats: {
    totalTransactions: number
    totalDeposits: number
  }
}

export default function BalancePage() {
  const [step, setStep] = useState<"pin" | "view">("pin")
  const [pin, setPin] = useState("")
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const { toast } = useToast()
  const { user, token, isAuthenticated } = useAuth()
  const [lastAttemptTime, setLastAttemptTime] = useState(0)

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-yellow-800 mb-4">Vui lòng đăng nhập để xem số dư</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handlePinComplete = async (enteredPin: string) => {
    // Prevent spam - add 1 second cooldown between attempts
    const now = Date.now()
    if (now - lastAttemptTime < 1000) {
      return
    }
    setLastAttemptTime(now)

    // Prevent multiple calls if already loading
    if (isLoading) {
      return
    }

    setPin(enteredPin)
    setIsLoading(true)

    try {
      const response = await fetch("/api/balance/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin: enteredPin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setBalanceData(data)
      setStep("view")
      toast({
        title: "Xác thực thành công",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi xác thực",
        description: error instanceof Error ? error.message : "Mã PIN không đúng",
        variant: "destructive",
      })
      // Reset PIN input after error
      setPin("")
      // Force re-render of PinInput by changing key
      setStep("pin")
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (balance: string) => {
    const num = Number.parseFloat(balance)
    return num.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  const resetView = () => {
    setStep("pin")
    setPin("")
    setBalanceData(null)
    setShowBalance(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Xem số dư tài khoản</h1>
          <p className="text-muted-foreground">Nhập mã PIN để xem số dư được mã hóa</p>
        </div>

        {step === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Xác thực mã PIN
              </CardTitle>
              <CardDescription>Nhập mã PIN 6 số để xem số dư tài khoản (Default: 123456)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || user?.email}</p>
                    <p className="text-sm text-muted-foreground">{user?.walletAddress}</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <PinInput
                  key={`pin-input-${Date.now()}`}
                  length={6}
                  onComplete={handlePinComplete}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Số dư của bạn được mã hóa và chỉ hiển thị sau khi xác thực PIN
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "view" && balanceData && (
          <>
            {/* Balance Display */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    Số dư tài khoản
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {showBalance ? `${formatBalance(balanceData.balance)} ETH` : "••••••••"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật lần cuối: {formatDate(balanceData.lastUpdated)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Địa chỉ ví:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {balanceData.walletAddress.substring(0, 10)}...
                        {balanceData.walletAddress.substring(balanceData.walletAddress.length - 8)}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balanceData.stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">Giao dịch đã thực hiện</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lần nạp tiền</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balanceData.stats.totalDeposits}</div>
                  <p className="text-xs text-muted-foreground">Lần nạp tiền thành công</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={resetView} variant="outline" className="flex-1 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ẩn số dư
              </Button>
              <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/deposit">Nạp thêm tiền</Link>
              </Button>
            </div>
          </>
        )}

        {/* Security Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Bảo mật số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Số dư được mã hóa end-to-end và lưu trữ an toàn</p>
              <p>• Chỉ bạn mới có thể xem số dư với mã PIN cá nhân</p>
              <p>• Hệ thống không lưu trữ số dư dưới dạng plain text</p>
              <p>• Mã PIN được yêu cầu cho mọi thao tác nhạy cảm</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
