# Hướng dẫn cấu hình thanh toán

## Tổng quan

Hệ thống hỗ trợ các phương thức thanh toán sau:
- **Stripe** - Thẻ tín dụng/ghi nợ quốc tế
- **PayPal** - Thanh toán qua PayPal
- **COD** - Thanh toán khi nhận hàng
- **Bank Transfer** - Chuyển khoản ngân hàng
- **MoMo** - Ví điện tử MoMo
- **ZaloPay** - Ví điện tử ZaloPay

---

## 1. Stripe Setup

### Bước 1: Tạo tài khoản Stripe
1. Truy cập [https://stripe.com](https://stripe.com)
2. Đăng ký tài khoản mới
3. Xác minh email và hoàn tất thông tin doanh nghiệp

### Bước 2: Lấy API Keys
1. Đăng nhập vào [Stripe Dashboard](https://dashboard.stripe.com)
2. Vào **Developers** > **API keys**
3. Copy **Publishable key** và **Secret key**

### Bước 3: Cấu hình Webhook
1. Vào **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Nhập URL: `https://your-domain.com/api/payment/stripe/webhook`
4. Chọn events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret**

### Bước 4: Thêm vào .env
```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Test với Stripe
Sử dụng thẻ test:
- **Thành công**: `4242 4242 4242 4242`
- **Thất bại**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

---

## 2. PayPal Setup

### Bước 1: Tạo tài khoản PayPal Developer
1. Truy cập [https://developer.paypal.com](https://developer.paypal.com)
2. Đăng nhập bằng tài khoản PayPal

### Bước 2: Tạo App
1. Vào **Dashboard** > **My Apps & Credentials**
2. Click **Create App**
3. Đặt tên app và chọn **Merchant** type
4. Click **Create App**

### Bước 3: Lấy Credentials
1. Trong app vừa tạo, copy **Client ID** và **Secret**
2. Chọn **Sandbox** để test hoặc **Live** cho production

### Bước 4: Thêm vào .env
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-secret"
PAYPAL_MODE="sandbox"  # hoặc "live"
```

### Test với PayPal Sandbox
1. Vào **Sandbox** > **Accounts**
2. Tạo tài khoản test buyer và seller
3. Sử dụng tài khoản buyer để test thanh toán

---

## 3. Cấu hình trong Admin

### Bật/Tắt phương thức thanh toán
1. Đăng nhập Admin
2. Vào **Cài đặt** > **Thanh toán**
3. Bật/tắt các phương thức theo nhu cầu

### Cấu hình thông tin chuyển khoản
Cho phương thức Bank Transfer, cấu hình:
- Tên ngân hàng
- Số tài khoản
- Tên chủ tài khoản
- Chi nhánh

---

## 4. Xử lý đơn hàng

### Luồng thanh toán online (Stripe/PayPal)
1. Khách hàng chọn sản phẩm → Checkout
2. Nhập thông tin giao hàng
3. Chọn phương thức thanh toán online
4. Hệ thống tạo đơn hàng với status `pending`
5. Khách hoàn tất thanh toán
6. Webhook cập nhật status → `processing`
7. Admin xử lý và giao hàng

### Luồng COD
1. Khách hàng checkout
2. Đơn hàng tạo với status `pending`
3. Admin xác nhận → `processing`
4. Giao hàng → `shipped`
5. Nhận tiền → `completed`

---

## 5. Troubleshooting

### Stripe không hoạt động
- Kiểm tra API keys đúng môi trường (test/live)
- Kiểm tra webhook URL accessible từ internet
- Xem logs trong Stripe Dashboard

### PayPal không hoạt động
- Kiểm tra Client ID và Secret
- Đảm bảo PAYPAL_MODE đúng (sandbox/live)
- Kiểm tra tài khoản PayPal đã verified

### Webhook không nhận được
- Kiểm tra URL public accessible
- Kiểm tra SSL certificate hợp lệ
- Xem webhook logs trong dashboard

---

## 6. Security Best Practices

1. **Không commit API keys** vào git
2. **Sử dụng environment variables** cho tất cả secrets
3. **Validate webhook signatures** để tránh fake requests
4. **Log tất cả transactions** để audit
5. **Test kỹ trước khi go live**

---

## 7. Currencies Support

### Stripe
- Hỗ trợ VND trực tiếp
- Minimum amount: 10,000 VND

### PayPal
- Không hỗ trợ VND trực tiếp
- Tự động convert sang USD
- Tỷ giá: ~24,000 VND = 1 USD

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề, liên hệ:
- Email: support@gamigear.vn
- Hotline: 1900 1234
