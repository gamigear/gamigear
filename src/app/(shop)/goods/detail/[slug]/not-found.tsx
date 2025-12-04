import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
      <p className="text-gray-500 mb-6">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
