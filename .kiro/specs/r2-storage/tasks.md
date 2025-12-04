# Implementation Plan

## 1. Setup and Configuration

- [x] 1.1 Install AWS SDK v3 dependencies
  - Install `@aws-sdk/client-s3` package
  - _Requirements: 3.1_

- [x] 1.2 Add R2 environment variables to `.env.example`
  - Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
  - _Requirements: 6.1_

- [x] 1.3 Update Prisma schema with storageProvider field
  - Add `storageProvider String @default("local")` to Media model
  - Run migration
  - _Requirements: 5.1, 5.3_

## 2. Storage Service Layer

- [x] 2.1 Create storage types and interfaces
  - Create `src/lib/storage/types.ts` with StorageProvider, StorageConfig, UploadResult, StorageService interfaces
  - _Requirements: 3.1, 4.1_

- [x] 2.2 Implement Local Storage Service
  - Create `src/lib/storage/local.ts` implementing StorageService interface
  - Migrate existing upload logic from API route
  - _Requirements: 3.1, 4.1_

- [ ]* 2.3 Write property test for filename generation
  - **Property 2: Unique Filename Generation**
  - **Validates: Requirements 3.2**

- [x] 2.4 Implement R2 Storage Service
  - Create `src/lib/storage/r2.ts` implementing StorageService interface
  - Use S3Client with R2 endpoint
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 2.5 Write property test for WebP conversion consistency
  - **Property 5: WebP Conversion Consistency**
  - **Validates: Requirements 3.5**

- [x] 2.6 Create Storage Factory
  - Create `src/lib/storage/index.ts` with getStorageService() and isR2Configured()
  - _Requirements: 1.4, 6.2_

- [ ]* 2.7 Write property test for fallback to local storage
  - **Property 1: Fallback to Local Storage**
  - **Validates: Requirements 1.4, 6.2**

## 3. Checkpoint - Ensure storage layer tests pass

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 4. API Layer Updates

- [x] 4.1 Update POST /api/media to support storage provider selection
  - Accept `storageProvider` form field
  - Use Storage Factory to get appropriate service
  - Store storageProvider in database
  - _Requirements: 2.1, 3.1, 5.1_

- [ ]* 4.2 Write property test for storage provider tracking
  - **Property 3: Storage Provider Tracking**
  - **Validates: Requirements 5.1**

- [x] 4.3 Update DELETE /api/media/[id] to handle both providers
  - Read storageProvider from media record
  - Use correct storage service for deletion
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 4.4 Write property test for correct storage service selection
  - **Property 4: Correct Storage Service Selection**
  - **Validates: Requirements 4.3**

- [x] 4.5 Update GET /api/media to return storageProvider
  - Include storageProvider in response
  - _Requirements: 5.2_

## 5. API for R2 Configuration Check

- [x] 5.1 Create GET /api/storage/config endpoint
  - Return { r2Configured: boolean, defaultProvider: string }
  - _Requirements: 2.2_

- [ ]* 5.2 Write property test for default provider behavior
  - **Property 6: Default Provider Behavior**
  - **Validates: Requirements 2.3**

## 6. Checkpoint - Ensure API tests pass

- [x] 6. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 7. Frontend Updates

- [x] 7.1 Update Media Library page with storage provider selector
  - Add dropdown to select storage provider (local/r2)
  - Disable R2 option when not configured
  - Show storage provider badge on media items
  - _Requirements: 2.1, 2.2_

- [x] 7.2 Fetch storage config on page load
  - Call /api/storage/config to check R2 availability
  - Set default provider based on config
  - _Requirements: 2.2, 2.3_

## 8. Final Checkpoint

- [x] 8. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

