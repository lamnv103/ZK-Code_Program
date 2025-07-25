# zkTransfer - Private Money Transfer

Ứng dụng chuyển tiền với quyền riêng tư cao sử dụng Zero-Knowledge Proof (ZKP). Ẩn danh số dư, công khai giao dịch.

## 🚀 Tính năng chính

- **Số dư ẩn danh**: Số dư tài khoản hoàn toàn bí mật
- **Giao dịch minh bạch**: Số tiền chuyển và địa chỉ người nhận được công khai
- **Zero-Knowledge Proof**: Chứng minh có đủ tiền mà không tiết lộ số dư thực tế
- **Responsive Design**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Headless components
- **Lucide React** - Icons

## 📦 Cài đặt

1. Clone repository:
\`\`\`bash
git clone <repository-url>
cd zk-transfer
\`\`\`

2. Cài đặt dependencies:
\`\`\`bash
npm install
# hoặc
yarn install
\`\`\`

3. Chạy development server:
\`\`\`bash
npm run dev
# hoặc
yarn dev
\`\`\`

4. Mở [http://localhost:3000](http://localhost:3000) trong browser

## 📁 Cấu trúc thư mục

\`\`\`
zk-transfer/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── history/           # Transaction history
│   ├── security/          # Security explanation
│   ├── transfer/          # Money transfer
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── navbar.tsx        # Navigation component
├── hooks/                # Custom hooks
├── lib/                  # Utility functions
└── public/               # Static assets
\`\`\`

## 🎨 Trang chính

1. **Trang chủ** - Dashboard với trạng thái tài khoản
2. **Chuyển tiền** - Form gửi tiền với ZKP verification
3. **Lịch sử giao dịch** - Danh sách giao dịch (không hiển thị số dư)
4. **Giải thích bảo mật** - Hướng dẫn về ZKP
5. **Đăng nhập/Đăng ký** - Authentication

## 🔐 Zero-Knowledge Proof

Ứng dụng sử dụng khái niệm ZKP để:
- Chứng minh người dùng có đủ số dư để chuyển tiền
- Không tiết lộ số dư thực tế
- Đảm bảo tính minh bạch cần thiết cho giao dịch

## 🚀 Deployment

Build production:
\`\`\`bash
npm run build
npm start
\`\`\`

## 📝 License

MIT License
\`\`\`

Bây giờ bạn đã có một dự án hoàn chỉnh với cấu trúc thư mục đầy đủ! 

## 🎯 **Hướng dẫn chạy:**

1. **Tạo thư mục mới:**
\`\`\`bash
mkdir zk-transfer
cd zk-transfer
\`\`\`

2. **Copy tất cả files** từ code project trên vào thư mục

3. **Cài đặt dependencies:**
\`\`\`bash
npm install
\`\`\`

4. **Chạy development server:**
\`\`\`bash
npm run dev
\`\`\`

5. **Mở http://localhost:3000** để xem kết quả

Dự án đã bao gồm tất cả các file cần thiết để chạy một ứng dụng Next.js hoàn chỉnh với TypeScript, Tailwind CSS và shadcn/ui components!
