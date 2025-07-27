import { Shield, Eye, EyeOff, Zap, Wallet, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
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
              <Link href="/balance">Xem số dư</Link>
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
              <CardDescription>Số dư tài khoản của bạn hoàn toàn bí mật, chỉ hiển thị khi có mã PIN</CardDescription>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Quản lý tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/balance" className="flex items-center gap-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Xem số dư (cần PIN)
                </Link>
              </Button>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/deposit" className="flex items-center gap-1">
                  <Wallet className="w-4 h-4 mr-2" />
                  Nạp tiền vào ví
                </Link>
              </Button>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/settings" className="flex items-center gap-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Đổi mã PIN
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Trạng thái bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Địa chỉ ví:</span>
                  <code className="bg-white px-2 py-1 rounded text-sm">0xabc...7890</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Số dư:</span>
                  <span className="text-muted-foreground">[Cần PIN để xem]</span>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">✅ Tài khoản được bảo vệ bởi mã PIN</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Số dư được mã hóa và chỉ hiển thị khi xác thực mã PIN thành công
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Về bảo mật mã PIN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>
                • <strong>Xem số dư:</strong> Yêu cầu mã PIN để giải mã và hiển thị số dư thực tế
              </p>
              <p>
                • <strong>Chuyển tiền:</strong> Mã PIN được sử dụng để xác thực mọi giao dịch
              </p>
              <p>
                • <strong>Đổi PIN:</strong> Có thể thay đổi mã PIN bất kỳ lúc nào trong cài đặt
              </p>
              <p>
                • <strong>Bảo mật:</strong> Mã PIN không được lưu trữ dưới dạng plain text
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
