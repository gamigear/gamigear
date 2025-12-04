# Deploy lên Vercel + Neon PostgreSQL

## Bước 1: Tạo Database trên Neon

1. Truy cập [neon.tech](https://neon.tech) và đăng ký/đăng nhập
2. Click **"New Project"**
3. Đặt tên project (vd: `gamigear-db`)
4. Chọn region gần nhất (Singapore hoặc Tokyo)
5. Copy **Connection string** (dạng `postgresql://...`)

## Bước 2: Setup Vercel

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng GitHub
2. Click **"Add New Project"**
3. Import repository từ GitHub
4. Cấu hình Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-random-string-32-chars
JWT_SECRET=generate-random-string-32-chars

# OAuth (nếu dùng)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx

# Payment
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=live

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
R2_PUBLIC_URL=https://xxx

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

5. Click **Deploy**

## Bước 3: Chạy Migration

Sau khi deploy thành công, chạy migration từ local:

```bash
# Set DATABASE_URL từ Neon
export DATABASE_URL="postgresql://..."

# Chạy migration
npx prisma migrate deploy

# (Optional) Seed data
npx prisma db seed
```

Hoặc thêm vào `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Bước 4: Cấu hình Domain (Optional)

1. Vào Project Settings > Domains
2. Thêm custom domain
3. Cập nhật DNS theo hướng dẫn
4. Cập nhật `NEXTAUTH_URL` và `NEXT_PUBLIC_APP_URL`

## Bước 5: Cập nhật OAuth Redirect URLs

Cập nhật redirect URL trong các OAuth provider:
- Google: `https://your-domain.vercel.app/api/auth/callback/google`
- Kakao: `https://your-domain.vercel.app/api/auth/callback/kakao`
- Naver: `https://your-domain.vercel.app/api/auth/callback/naver`

## Lưu ý quan trọng

1. **NEXTAUTH_SECRET**: Generate bằng `openssl rand -base64 32`
2. **Stripe Webhook**: Tạo webhook mới trên Stripe Dashboard với URL production
3. **R2 CORS**: Cấu hình CORS cho domain mới trên Cloudflare R2

## Troubleshooting

### Lỗi Prisma Client
```bash
# Thêm vào package.json scripts
"postinstall": "prisma generate"
```

### Lỗi Database Connection
- Kiểm tra DATABASE_URL có `?sslmode=require`
- Kiểm tra IP whitelist trên Neon (mặc định cho phép tất cả)

### Lỗi Build
```bash
# Test build local trước
npm run build
```
