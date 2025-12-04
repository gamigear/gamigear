# OAuth Setup Guide

## Cấu hình đăng nhập bằng mạng xã hội

### 1. Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Thêm Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** và **Client Secret** vào file `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### 2. Facebook OAuth

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo App mới
3. Thêm sản phẩm **Facebook Login**
4. Vào **Settings** > **Basic** để lấy App ID và App Secret
5. Vào **Facebook Login** > **Settings**:
   - Thêm Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/callback/facebook`
     - `https://yourdomain.com/api/auth/callback/facebook`
6. Copy vào file `.env`:
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

### 3. Apple OAuth

1. Truy cập [Apple Developer](https://developer.apple.com/)
2. Vào **Certificates, Identifiers & Profiles**
3. Tạo **App ID** với Sign In with Apple capability
4. Tạo **Services ID** cho web authentication
5. Cấu hình **Return URLs**:
   - `https://yourdomain.com/api/auth/callback/apple`
6. Tạo **Key** cho Sign In with Apple
7. Copy vào file `.env`:
   ```
   APPLE_CLIENT_ID=your-services-id
   APPLE_CLIENT_SECRET=your-generated-secret
   ```

### 4. Kakao OAuth

1. Truy cập [Kakao Developers](https://developers.kakao.com/)
2. Tạo Application mới
3. Vào **앱 설정** > **앱 키** để lấy REST API 키
4. Vào **카카오 로그인** > **활성화 설정** > ON
5. Thêm **Redirect URI**:
   - `http://localhost:3000/api/auth/callback/kakao`
   - `https://yourdomain.com/api/auth/callback/kakao`
6. Vào **보안** để lấy Client Secret
7. Copy vào file `.env`:
   ```
   KAKAO_CLIENT_ID=your-rest-api-key
   KAKAO_CLIENT_SECRET=your-client-secret
   ```

### 5. Naver OAuth

1. Truy cập [Naver Developers](https://developers.naver.com/)
2. Vào **Application** > **애플리케이션 등록**
3. Chọn **네이버 로그인** API
4. Thêm **Callback URL**:
   - `http://localhost:3000/api/auth/callback/naver`
   - `https://yourdomain.com/api/auth/callback/naver`
5. Copy **Client ID** và **Client Secret** vào file `.env`:
   ```
   NAVER_CLIENT_ID=your-client-id
   NAVER_CLIENT_SECRET=your-client-secret
   ```

## Biến môi trường cần thiết

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Facebook
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Apple
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# Kakao
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""

# Naver
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""
```

## Lưu ý

- Đảm bảo `NEXTAUTH_SECRET` được tạo ngẫu nhiên và bảo mật
- Trong production, sử dụng HTTPS cho tất cả callback URLs
- Kiểm tra kỹ các quyền (scopes) được yêu cầu từ mỗi provider
