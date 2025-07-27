"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, QrCode, CheckCircle, Loader2, ArrowLeft, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [isQrGenerated, setIsQrGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const { toast } = useToast()

  const handleGenerateQr = () => {
    const parsedAmount = Number.parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền nạp hợp lệ.",
        variant: "destructive",
      })
      return
    }
    setQrCodeUrl(`/placeholder.svg?height=200&width=200&query=QR%20code%20for%20${amount}%20ETH`)
    setIsQrGenerated(true)
  }

  const handleConfirmDeposit = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để nạp tiền.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number.parseFloat(amount) }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Không thể nạp tiền.")
      }

      const data = await response.json()
      setDepositSuccess(true)
      toast({
        title: "Nạp tiền thành công!",
        description: `Bạn đã nạp thành công ${data.deposit.amount} ETH. Số dư mới: ${data.newBalance} ETH (ảo).`,
      })
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Lỗi nạp tiền",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi nạp tiền.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (depositSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Nạp tiền thành công!</CardTitle>
              <CardDescription>Số tiền đã được cộng vào ví của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Số tiền nạp:</span>
                  <span className="font-semibold">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="text-green-600 font-medium">Hoàn thành</span>
                </div>
              </div>
              <Button onClick={() => setDepositSuccess(false)} className="w-full" variant="outline">
                Nạp thêm tiền
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
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Nạp tiền vào ví</h1>
          <p className="text-muted-foreground">Nạp tiền ảo vào ví ZK của bạn</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nhập số tiền nạp</CardTitle>
            <CardDescription>Số tiền sẽ được cộng vào số dư ảo của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isQrGenerated || isLoading}
                  required
                />
              </div>

              {!isQrGenerated ? (
                <Button
                  onClick={handleGenerateQr}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={isLoading || !amount || Number.parseFloat(amount) <= 0}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Tạo QR nạp tiền
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-2">Quét mã QR để nạp {amount} ETH</p>
                    <Image
                      src={qrCodeUrl || "/placeholder.svg"}
                      alt="QR Code for Deposit"
                      width={200}
                      height={200}
                      className="mx-auto rounded-md"
                    />
                    <p className="text-xs text-muted-foreground mt-2">(Đây là QR ảo cho mục đích demo)</p>
                  </div>
                  <Button
                    onClick={handleConfirmDeposit}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xác nhận nạp tiền...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận đã nạp tiền
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsQrGenerated(false)}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <Shield className="w-4 h-4 inline mr-1" />
            Số dư của bạn được mã hóa và chỉ bạn mới có thể truy cập.
          </p>
        </div>
      </div>
    </div>
  )
}
