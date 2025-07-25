"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TransferPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate ZKP generation
      const zkProofData = {
        proof: {
          pi_a: ["0x123...", "0x456..."],
          pi_b: [
            ["0x789...", "0xabc..."],
            ["0xdef...", "0x012..."],
          ],
          pi_c: ["0x345...", "0x678..."],
        },
        publicSignals: [amount, recipient, "0x999..."], // amount, recipient, commitment
        proofHash: "zk_" + Math.random().toString(36).substr(2, 9),
      }

      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          toAddress: recipient,
          amount: amount,
          zkProof: zkProofData,
        }),
      })

      if (response.ok) {
        setIsLoading(false)
        setIsSuccess(true)
        toast({
          title: "Giao dịch thành công!",
          description: "ZK Proof đã được xác minh và giao dịch được tạo.",
        })
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "Lỗi giao dịch",
        description: "Không thể thực hiện giao dịch. Vui lòng thử lại.",
      })
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Giao dịch thành công!</CardTitle>
              <CardDescription>Máy chủ xác minh bạn đủ điều kiện chuyển tiền.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Người nhận:</span>
                  <code className="text-sm">{recipient}</code>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-semibold">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="text-green-600 font-medium">✅ Đã xác minh</span>
                </div>
              </div>
              <Button onClick={() => setIsSuccess(false)} className="w-full" variant="outline">
                Thực hiện giao dịch khác
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
          <p className="text-muted-foreground">Thực hiện giao dịch với Zero-Knowledge Proof</p>
        </div>

        {/* Sender Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Thông tin người gửi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Địa chỉ ví:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">0xabc...7890</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Số dư hiện tại:</span>
              <span className="text-muted-foreground">[Không hiển thị]</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ Tài khoản của bạn đã được chứng minh đủ điều kiện chuyển tiền này.
              </p>
              <p className="text-green-700 text-xs mt-1">(Dựa trên Zero-Knowledge Proof)</p>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form chuyển tiền</CardTitle>
            <CardDescription>Chỉ số tiền chuyển là công khai, số dư của bạn vẫn được bảo mật</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Địa chỉ người nhận</Label>
                <Input
                  id="recipient"
                  placeholder="Ví dụ: 0x4f1e...cd23"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền cần chuyển (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">* Chỉ số tiền này là công khai</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Đang xử lý ZKP..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi bằng ZKP
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
