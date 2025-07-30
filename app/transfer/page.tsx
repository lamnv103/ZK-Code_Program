"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PinInput } from "@/components/pin-input"
import { Shield, Send, CheckCircle, Loader2, ArrowLeft, User, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Recipient {
  id: string
  email: string
  name: string
  walletAddress: string
}

type TransferStep = "input" | "verify" | "pin" | "confirm" | "success"

export default function TransferPage() {
  const [step, setStep] = useState<TransferStep>("input")
  const [recipientAccount, setRecipientAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [balanceCheck, setBalanceCheck] = useState<any>(null)
  const [transferPin, setTransferPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<any>(null)
  const { toast } = useToast()

  const handleFindRecipient = async () => {
    if (!recipientAccount.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email hoặc địa chỉ ví người nhận",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để thực hiện chuyển tiền",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/transfer/find-recipient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientAccount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setRecipient(data.recipient)
      setStep("verify")
      toast({
        title: "Thành công",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tìm thấy người nhận",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckBalance = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transfer/check-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setBalanceCheck(data)

      if (data.hasSufficientBalance) {
        setStep("pin")
        toast({
          title: "Kiểm tra thành công",
          description: data.message,
        })
      } else {
        toast({
          title: "Số dư không đủ",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể kiểm tra số dư",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinComplete = (pin: string) => {
    setTransferPin(pin)
    setStep("confirm")
  }

  const handleExecuteTransfer = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transfer/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: recipient?.id,
          amount,
          transferPin,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setTransferResult(data)
      setStep("success")
      toast({
        title: "Chuyển tiền thành công!",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi chuyển tiền",
        description: error instanceof Error ? error.message : "Không thể thực hiện chuyển tiền",
        variant: "destructive",
      })
      setStep("pin") // Go back to PIN step
    } finally {
      setIsLoading(false)
    }
  }

  const resetTransfer = () => {
    setStep("input")
    setRecipientAccount("")
    setAmount("")
    setDescription("")
    setRecipient(null)
    setBalanceCheck(null)
    setTransferPin("")
    setTransferResult(null)
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Chuyển tiền thành công!</CardTitle>
              <CardDescription>Giao dịch đã được thực hiện thành công</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Người nhận:</span>
                  <span className="font-semibold">{transferResult?.transfer.recipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-sm">{transferResult?.transfer.recipient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-semibold text-lg">{transferResult?.transfer.amount} ETH</span>
                </div>
              </div>
              <Button onClick={resetTransfer} className="w-full bg-transparent" variant="outline">
                Thực hiện giao dịch khác
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Chuyển tiền</h1>
          <p className="text-muted-foreground">Chuyển tiền an toàn với Zero-Knowledge Proof</p>
        </div>

        {/* Step 1: Input recipient and amount */}
        {step === "input" && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyển tiền</CardTitle>
              <CardDescription>Nhập thông tin người nhận và số tiền cần chuyển</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Email hoặc địa chỉ ví người nhận</Label>
                <Input
                  id="recipient"
                  placeholder="user@example.com hoặc 0x..."
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleFindRecipient} className="w-full" disabled={isLoading || !recipientAccount.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Tìm người nhận
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verify recipient and enter amount */}
        {step === "verify" && recipient && (
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận người nhận</CardTitle>
              <CardDescription>Kiểm tra thông tin người nhận và nhập số tiền</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{recipient.name}</p>
                    <p className="text-sm text-muted-foreground">{recipient.email}</p>
                    <p className="text-xs text-muted-foreground">{recipient.walletAddress}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Nội dung chuyển tiền..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("input")} variant="outline" className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleCheckBalance}
                  className="flex-1"
                  disabled={isLoading || !amount || Number.parseFloat(amount) <= 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Kiểm tra số dư
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter PIN */}
        {step === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle>Nhập mã PIN chuyển tiền</CardTitle>
              <CardDescription>Nhập mã PIN 6 số để xác thực giao dịch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {balanceCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Số dư đủ để thực hiện giao dịch</span>
                  </div>
                  {/* <p className="text-sm text-green-700 mt-1">Số dư hiện tại: {balanceCheck.currentBalance} ETH</p> */}
                </div>
              )}

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Nhập mã PIN chuyển tiền (6 chữ số)</p>
                <PinInput length={6} onComplete={handlePinComplete} disabled={isLoading} />
              </div>

              <Button onClick={() => setStep("verify")} variant="outline" className="w-full" disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm transfer */}
        {step === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận chuyển tiền</CardTitle>
              <CardDescription>Kiểm tra lại thông tin trước khi thực hiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Xác nhận giao dịch</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Người nhận:</span>
                    <span className="font-semibold">{recipient?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{recipient?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền:</span>
                    <span className="font-semibold text-lg">{amount} ETH</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span>Ghi chú:</span>
                      <span>{description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("pin")} variant="outline" className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleExecuteTransfer}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang chuyển...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Xác nhận chuyển tiền
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ZKP Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Về Zero-Knowledge Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Số dư của bạn được mã hóa và bảo mật tuyệt đối</p>
              <p>• Hệ thống chỉ xác minh bạn có đủ số dư mà không biết số tiền cụ thể</p>
              <p>• Giao dịch được thực hiện an toàn với mã PIN bảo vệ</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
