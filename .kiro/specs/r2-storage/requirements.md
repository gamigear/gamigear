# Requirements Document

## Introduction

Tính năng này cho phép hệ thống Media Library sử dụng Cloudflare R2 Object Storage song song với Local Storage hiện tại. Admin có thể chọn storage provider khi upload file, và hệ thống sẽ tự động xử lý việc lưu trữ, truy xuất và xóa file từ provider tương ứng.

## Glossary

- **R2**: Cloudflare R2 Object Storage - dịch vụ lưu trữ đối tượng tương thích S3 API
- **Local Storage**: Lưu trữ file trên hệ thống file local (thư mục public/uploads)
- **Storage Provider**: Nhà cung cấp dịch vụ lưu trữ (local hoặc r2)
- **Media**: Tệp tin được upload lên hệ thống (hình ảnh, video, PDF, etc.)
- **Bucket**: Container lưu trữ trong R2
- **Public URL**: URL công khai để truy cập file từ R2

## Requirements

### Requirement 1: Storage Provider Configuration

**User Story:** As an administrator, I want to configure R2 storage credentials, so that the system can connect to Cloudflare R2.

#### Acceptance Criteria

1. WHEN an administrator accesses the settings page THEN the system SHALL display R2 configuration fields (Account ID, Access Key ID, Secret Access Key, Bucket Name, Public URL)
2. WHEN an administrator saves R2 credentials THEN the system SHALL validate the connection before saving
3. WHEN R2 credentials are invalid THEN the system SHALL display an error message and prevent saving
4. WHEN R2 is not configured THEN the system SHALL default to local storage only

### Requirement 2: Storage Provider Selection

**User Story:** As an administrator, I want to choose where to store uploaded files, so that I can use R2 for production and local for development.

#### Acceptance Criteria

1. WHEN uploading a file THEN the system SHALL allow selection between "local" and "r2" storage providers
2. WHEN R2 is not configured THEN the system SHALL disable the R2 option and show only local storage
3. WHEN a default storage provider is set THEN the system SHALL use that provider for new uploads unless overridden

### Requirement 3: File Upload to R2

**User Story:** As an administrator, I want to upload files to R2, so that files are stored in cloud storage for better scalability.

#### Acceptance Criteria

1. WHEN a file is uploaded with R2 provider selected THEN the system SHALL upload the file to the configured R2 bucket
2. WHEN uploading to R2 THEN the system SHALL generate a unique filename with timestamp prefix
3. WHEN upload to R2 succeeds THEN the system SHALL store the R2 public URL in the database
4. WHEN upload to R2 fails THEN the system SHALL return an error message and not create a media record
5. WHEN uploading images to R2 THEN the system SHALL support WebP conversion same as local storage

### Requirement 4: File Deletion from R2

**User Story:** As an administrator, I want to delete files from R2, so that unused files are removed from cloud storage.

#### Acceptance Criteria

1. WHEN a media record with R2 storage is deleted THEN the system SHALL delete the file from R2 bucket
2. WHEN R2 deletion fails THEN the system SHALL log the error but still delete the database record
3. WHEN deleting a file THEN the system SHALL identify the correct storage provider from the media record

### Requirement 5: Database Schema Update

**User Story:** As a developer, I want the media table to track storage provider, so that the system knows where each file is stored.

#### Acceptance Criteria

1. WHEN a new media record is created THEN the system SHALL store the storage provider type (local or r2)
2. WHEN querying media THEN the system SHALL return the storage provider information
3. WHEN migrating existing data THEN the system SHALL set storage provider to "local" for all existing records

### Requirement 6: Environment Configuration

**User Story:** As a developer, I want to configure R2 via environment variables, so that credentials are not hardcoded.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL read R2 configuration from environment variables
2. WHEN R2 environment variables are missing THEN the system SHALL operate in local-only mode
3. WHEN R2 is configured THEN the system SHALL validate the configuration on startup

