import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Eye, Edit } from "lucide-react";
import Card from "@/components/admin/Card";
import { adminProducts } from "@/data/admin";
import { formatPrice } from "@/lib/utils";

export default function ShopPage() {
  const publishedProducts = adminProducts.filter((p) => p.status === "published");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shop Preview</h1>
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <ExternalLink size={16} />
          View Live Store
        </a>
      </div>

      {/* Store Preview */}
      <Card>
        <div className="p-6">
          {/* Header Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="bg-black text-white text-xs py-2 px-4 text-center">
              무료배송 5만원 이상 구매시
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-xl font-bold">GAMIGEAR</span>
              <div className="flex gap-4 text-sm">
                <span>NEW</span>
                <span>BEST</span>
                <span>TOP</span>
                <span>BOTTOM</span>
              </div>
            </div>
          </div>

          {/* Products Grid Preview */}
          <h3 className="font-medium mb-4">Published Products ({publishedProducts.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {publishedProducts.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="p-2 bg-white rounded-full">
                      <Eye size={16} />
                    </button>
                    <Link href={`/admin/products/${product.id}/edit`} className="p-2 bg-white rounded-full">
                      <Edit size={16} />
                    </Link>
                  </div>
                </div>
                <h4 className="text-sm font-medium truncate">{product.name}</h4>
                <p className="text-sm font-bold">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Store Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Store Info">
          <div className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Store Name</span>
              <span className="font-medium">Gamigear</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Products</span>
              <span className="font-medium">{publishedProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="font-medium">7</span>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="p-6 space-y-3">
            <Link
              href="/admin/products/new"
              className="block w-full py-2 text-center border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/settings"
              className="block w-full py-2 text-center border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              Store Settings
            </Link>
            <button className="w-full py-2 text-center border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              Customize Theme
            </button>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Last product added</span>
              <span>2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last order</span>
              <span>30 mins ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Store views today</span>
              <span>1,234</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
