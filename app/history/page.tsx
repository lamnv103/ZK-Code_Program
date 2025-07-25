"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface Transaction {
  id: string
  toAddress: string
  amount: string
  status: string
  createdAt: string
  zkProofHash: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-600" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Đã xác minh</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⏳ Đang xử lý</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Không hợp lệ</Badge>
    default:
      return null
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vui lòng đăng nhập để xem lịch sử giao dịch")
        setLoading(false)
        return
      }

      const response = await fetch("/api/transactions/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể tải lịch sử giao dịch")
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Lịch sử giao dịch</h1>
          <p className="text-muted-foreground">Danh sách các giao dịch đã thực hiện (không hiển thị số dư)</p>
        </div>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Chưa có giao dịch nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="font-medium">Giao dịch #{tx.id.substring(0, 8)}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Người nhận:</span>{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">{tx.toAddress}</code>
                        </div>
                        <div>
                          <span className="font-medium">Thời gian:</span> {formatDate(tx.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="text-2xl font-bold">{tx.amount} ETH</div>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Lưu ý về quyền riêng tư</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm">
              ✔️ Không hiển thị số dư hay chi tiết ví của người gửi (bạn)
              <br />
              ✔️ Chỉ hiển thị thông tin giao dịch công khai: địa chỉ người nhận, số tiền, thời gian
              <br />
              ✔️ Trạng thái xác minh dựa trên Zero-Knowledge Proof
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
