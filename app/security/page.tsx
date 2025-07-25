import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Giải thích Bảo mật</h1>
          <p className="text-xl text-muted-foreground">Hiểu cách Zero-Knowledge Proof (ZKP) hoạt động</p>
        </div>

        {/* Visual Diagram */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cách thức hoạt động của ZKP</CardTitle>
            <CardDescription>Biểu đồ minh họa quá trình chứng minh không tiết lộ thông tin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <EyeOff className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">Bước 1: Tạo bằng chứng</h3>
                <p className="text-sm text-muted-foreground">
                  Người A tạo bằng chứng ZKP (zk-SNARK/zk-STARK) chứng minh có đủ số dư
                </p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold">Bước 2: Xác minh</h3>
                <p className="text-sm text-muted-foreground">
                  Server xác minh bằng chứng mà không cần biết số dư thực tế
                </p>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-800 mb-2">Kết quả</h3>
                <p className="text-green-700">Server xác nhận: "Số dư ≥ Số tiền chuyển" mà không biết số dư cụ thể</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simple Explanation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Giải thích đơn giản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                "Bạn không cần tiết lộ thông tin bí mật (số dư), bạn chỉ cần chứng minh rằng bạn có đủ tiền để thực hiện
                giao dịch."
              </h4>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Thông tin công khai
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Địa chỉ người nhận
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Số tiền chuyển
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Thời gian giao dịch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Trạng thái xác minh
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-red-600" />
                  Thông tin bí mật
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-600" />
                    Số dư tài khoản
                  </li>
                  <li className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-600" />
                    Lịch sử số dư
                  </li>
                  <li className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-600" />
                    Khóa riêng tư
                  </li>
                  <li className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-600" />
                    Chi tiết tài khoản
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết kỹ thuật</CardTitle>
            <CardDescription>Các công nghệ ZKP được sử dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">zk-SNARK</h4>
                <p className="text-sm text-muted-foreground">
                  Zero-Knowledge Succinct Non-Interactive Argument of Knowledge - Bằng chứng ngắn gọn, không tương tác
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">zk-STARK</h4>
                <p className="text-sm text-muted-foreground">
                  Zero-Knowledge Scalable Transparent Argument of Knowledge - Bằng chứng có thể mở rộng, minh bạch
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2">Ưu điểm của ZKP trong chuyển tiền:</h4>
              <ul className="text-sm space-y-1">
                <li>• Bảo vệ quyền riêng tư tuyệt đối</li>
                <li>• Đảm bảo tính minh bạch cần thiết</li>
                <li>• Ngăn chặn gian lận mà không tiết lộ thông tin</li>
                <li>• Tuân thủ các quy định về bảo mật dữ liệu</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
