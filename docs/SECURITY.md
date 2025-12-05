# Hướng dẫn Bảo mật Website

## 1. Các biện pháp đã triển khai

### 1.1 Authentication & Authorization
- ✅ JWT verification với signature validation (sử dụng `jose` library)
- ✅ Middleware kiểm tra quyền truy cập admin routes
- ✅ API authentication helpers (`src/lib/api-auth.ts`)
- ✅ Role-based access control (RBAC)

### 1.2 Security Headers
- ✅ `Strict-Transport-Security` (HSTS)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-XSS-Protection`
- ✅ `Referrer-Policy`
- ✅ `Permissions-Policy`

### 1.3 Input Validation & Sanitization
- ✅ File upload validation (`src/lib/security.ts`)
- ✅ Rate limiting
- ✅ Password strength validation

### 1.4 API Routes đã được bảo vệ
- ✅ `/api/products` (POST) - Tạo sản phẩm
- ✅ `/api/products/bulk-edit` (POST) - Chỉnh sửa hàng loạt
- ✅ `/api/products/bulk-sale` (POST, PATCH, DELETE) - Giảm giá hàng loạt
- ✅ `/api/categories` (POST) - Tạo danh mục
- ✅ `/api/users` (GET, POST) - Quản lý users
- ✅ `/api/settings` (PUT) - Cập nhật cài đặt
- ✅ `/api/coupons` (POST) - Tạo coupon
- ✅ `/api/shipping` (POST) - Tạo shipping zone
- ✅ `/api/taxes` (POST) - Tạo tax rate
- ✅ `/api/upload` - Upload file (có rate limiting)
- ✅ `/api/webhooks` (GET, POST) - Quản lý webhooks
- ✅ `/api/media` (POST) - Upload media
- ✅ `/api/woocommerce/sites` (GET, POST) - Quản lý WooCommerce sites
- ✅ `/api/woocommerce/sites/[id]/sync` (POST) - Sync sản phẩm

## 2. Cấu hình bắt buộc cho Production

### 2.1 Environment Variables
```bash
# QUAN TRỌNG: Tạo secrets mạnh
openssl rand -base64 32  # Cho JWT_SECRET
openssl rand -base64 32  # Cho NEXTAUTH_SECRET

# Đảm bảo các biến này được set
JWT_SECRET=<generated-secret>
NEXTAUTH_SECRET=<generated-secret>
NODE_ENV=production
```

### 2.2 Database Security
```bash
# Sử dụng PostgreSQL với SSL trong production
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## 3. Checklist bảo mật API Routes

### 3.1 Routes cần bảo vệ (Admin only)
Thêm authentication check vào các routes sau:

```typescript
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }
  // ... rest of handler
}
```

Routes đã được bảo vệ đầy đủ:
- ✅ `/api/products/[id]` (PUT, DELETE)
- ✅ `/api/categories/[id]` (PUT, DELETE)
- ✅ `/api/orders/[id]` (PUT, DELETE)
- ✅ `/api/posts` (POST) + `/api/posts/[id]` (PUT, DELETE)
- ✅ `/api/pages` (POST) + `/api/pages/[id]` (PUT, DELETE)
- ✅ `/api/banners` (POST) + `/api/banners/[id]` (PUT, DELETE)
- ✅ `/api/landing-pages` (POST) + `/api/landing-pages/[id]` (PUT, DELETE)

Routes còn cần cập nhật (nếu cần):
- [ ] `/api/coupons/[id]` (PUT, DELETE)
- [ ] `/api/shipping/[id]` (PUT, DELETE)
- [ ] `/api/taxes/[id]` (PUT, DELETE)
- [ ] `/api/users/[id]` (PUT, DELETE) - Đã có auth trong file riêng

### 3.2 Routes công khai (không cần auth)
- `/api/products` (GET) - Xem sản phẩm
- `/api/categories` (GET) - Xem danh mục
- `/api/auth/login` - Đăng nhập
- `/api/auth/register` - Đăng ký
- `/api/search` - Tìm kiếm

## 4. Bảo vệ chống tấn công phổ biến

### 4.1 SQL Injection
- ✅ Sử dụng Prisma ORM với parameterized queries
- ✅ Validate ID format trước khi query

### 4.2 XSS (Cross-Site Scripting)
- ✅ React tự động escape output
- ✅ Security headers ngăn inline scripts
- ⚠️ Cẩn thận với `dangerouslySetInnerHTML`

### 4.3 CSRF (Cross-Site Request Forgery)
- ✅ SameSite cookie attribute
- ⚠️ Cân nhắc thêm CSRF token cho forms quan trọng

### 4.4 Rate Limiting
```typescript
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/security';

// Trong API handler
const clientIP = getClientIP(request);
const rateLimit = checkRateLimit(`api:${clientIP}`, { 
  windowMs: 60000,  // 1 phút
  maxRequests: 100  // 100 requests/phút
});

if (!rateLimit.allowed) {
  return rateLimitResponse(rateLimit.resetTime);
}
```

## 5. Monitoring & Logging

### 5.1 Cần theo dõi
- Failed login attempts
- Unusual API access patterns
- File upload activities
- Admin actions

### 5.2 Không log
- Passwords (kể cả hashed)
- Full credit card numbers
- Personal identification numbers

## 6. Backup & Recovery

### 6.1 Database Backup
```bash
# Backup hàng ngày
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 6.2 Media Backup
- Sử dụng Cloudflare R2 với versioning enabled
- Backup định kỳ sang storage khác

## 7. Cập nhật Dependencies

```bash
# Kiểm tra vulnerabilities
npm audit

# Cập nhật packages
npm update

# Kiểm tra outdated packages
npm outdated
```

## 8. Cloudflare Security (Khuyến nghị)

### 8.1 WAF Rules
- Enable Managed Rules
- Block known bad bots
- Rate limiting at edge

### 8.2 DDoS Protection
- Enable Under Attack Mode khi cần
- Configure challenge pages

### 8.3 SSL/TLS
- Full (strict) mode
- Minimum TLS 1.2
- Enable HSTS

## 9. Bảo mật Tài khoản Quản trị

### 9.1 Các biện pháp đã triển khai
- ✅ Rate limiting cho login (10 requests/phút)
- ✅ Account lockout sau 5 lần đăng nhập thất bại (khóa 15 phút)
- ✅ Logging tất cả hoạt động đăng nhập (thành công/thất bại)
- ✅ Constant-time password comparison (chống timing attack)
- ✅ Password strength validation khi đổi mật khẩu
- ✅ Session activity tracking

### 9.2 API Endpoints mới
- `POST /api/admin/auth/change-password` - Đổi mật khẩu
- `GET /api/admin/auth/sessions` - Xem lịch sử đăng nhập

### 9.3 Yêu cầu mật khẩu
- Tối thiểu 8 ký tự
- Ít nhất 1 chữ hoa
- Ít nhất 1 chữ thường
- Ít nhất 1 số
- Ít nhất 1 ký tự đặc biệt

### 9.4 Khuyến nghị bổ sung
- [ ] Triển khai 2FA (Two-Factor Authentication)
- [ ] Session timeout sau 30 phút không hoạt động
- [ ] Thông báo email khi đăng nhập từ thiết bị mới
- [ ] IP whitelist cho admin panel (nếu cần)

## 10. Liên hệ khi có sự cố

Nếu phát hiện lỗ hổng bảo mật:
1. Không công khai thông tin
2. Liên hệ admin ngay lập tức
3. Ghi lại chi tiết sự cố
