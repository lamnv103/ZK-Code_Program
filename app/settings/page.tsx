"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PinInput } from "@/components/pin-input"
import { Shield, Settings, CheckCircle, Loader2, ArrowLeft, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

type ChangeStep = "current" | "new" | "confirm" | "success"

export default function SettingsPage() {
  const [step, setStep] = useState<ChangeStep>("current")
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, token, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-yellow-800 mb-4">Vui lòng đăng nhập để truy cập cài đặt</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleCurrentPinComplete = (pin: string) => {
    setCurrentPin(pin)
    setStep("new")
  }

  const handleNewPinComplete = (pin: string) => {
    setNewPin(pin)
    setStep("confirm")
  }

  const handleConfirmPinComplete = async (pin: string) => {
    setConfirmPin(pin)

    if (pin !== newPin) {
      toast({
        title: "Lỗi xác nhận",
        description: "Mã PIN mới và xác nhận không khớp",
        variant: "destructive",
      })
      setStep("new")
      setNewPin("")
      setConfirmPin("")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/change-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPin,
          newPin,
          confirmPin: pin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setStep("success")
      toast({
        title: "Thành công",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi đổi PIN",
        description: error instanceof Error ? error.message : "Không thể đổi mã PIN",
        variant: "destructive",
      })
      setStep("current")
      resetPins()
    } finally {
      setIsLoading(false)
    }
  }

  const resetPins = () => {
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
  }

  const startOver = () => {
    setStep("current")
    resetPins()
  }

  const getStepTitle = () => {
    switch (step) {
      case "current":
        return "Nhập mã PIN hiện tại"
      case "new":
        return "Nhập mã PIN mới"
      case "confirm":
        return "Xác nhận mã PIN mới"
      case "success":
        return "Đổi PIN thành công"
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case "current":
        return "Xác thực mã PIN hiện tại để tiếp tục (Default: 123456)"
      case "new":
        return "Nhập mã PIN mới (6 chữ số)"
      case "confirm":
        return "Nhập lại mã PIN mới để xác nhận"
      case "success":
        return "Mã PIN đã được cập nhật thành công"
      default:
        return ""
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Cài đặt tài khoản</h1>
          <p className="text-muted-foreground">Quản lý mã PIN và bảo mật tài khoản</p>
        </div>

        {step !== "success" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                {getStepTitle()}
              </CardTitle>
              <CardDescription>{getStepDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || user?.email}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${step === "current" ? "bg-blue-600" : "bg-green-600"}`} />
                <div className={`w-8 h-0.5 ${step === "new" || step === "confirm" ? "bg-blue-600" : "bg-gray-300"}`} />
                <div
                  className={`w-3 h-3 rounded-full ${
                    step === "new" ? "bg-blue-600" : step === "confirm" ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                <div className={`w-8 h-0.5 ${step === "confirm" ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-3 h-3 rounded-full ${step === "confirm" ? "bg-blue-600" : "bg-gray-300"}`} />
              </div>

              {/* PIN Input */}
              <div className="text-center space-y-4">
                {step === "current" && (
                  <PinInput length={6} onComplete={handleCurrentPinComplete} disabled={isLoading} />
                )}
                {step === "new" && <PinInput length={6} onComplete={handleNewPinComplete} disabled={isLoading} />}
                {step === "confirm" && (
                  <PinInput length={6} onComplete={handleConfirmPinComplete} disabled={isLoading} />
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                {step !== "current" && (
                  <Button
                    onClick={() => {
                      if (step === "new") {
                        setStep("current")
                        setNewPin("")
                      } else if (step === "confirm") {
                        setStep("new")
                        setConfirmPin("")
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                )}
                <Button onClick={startOver} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
                  Bắt đầu lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Đổi PIN thành công!</CardTitle>
              <CardDescription>Mã PIN mới đã được cập nhật và có hiệu lực ngay lập tức</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tài khoản:</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian cập nhật:</span>
                  <span>{new Date().toLocaleString("vi-VN")}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={startOver} variant="outline" className="flex-1 bg-transparent">
                  Đổi PIN khác
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Link href="/">Về trang chủ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Lưu ý bảo mật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-yellow-700 text-sm">
              <p>• Mã PIN được sử dụng để xem số dư và thực hiện chuyển tiền</p>
              <p>• Không chia sẻ mã PIN với bất kỳ ai</p>
              <p>• Chọn mã PIN khó đoán và không sử dụng thông tin cá nhân</p>
              <p>• Thay đổi mã PIN định kỳ để đảm bảo bảo mật</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
