import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hàm tạo slug từ tên
function generateSlug(name: string): string {
  // Loại bỏ các ký tự đặc biệt và emoji ở đầu
  let cleanName = name
    .replace(/^[♥★☆●○◆◇■□▲△▼▽※]+/g, '') // Remove special chars at start
    .replace(/\[.*?\]/g, ' ') // Remove text in brackets
    .trim();
  
  // Chuyển đổi tiếng Hàn sang romanji đơn giản
  const koreanMap: Record<string, string> = {
    '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
    '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
    '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
    '어린이': 'kids', '아이': 'kids', '세트': 'set', '권': 'vol',
    '개월': 'months', '정기구독': 'subscription',
  };
  
  for (const [korean, roman] of Object.entries(koreanMap)) {
    cleanName = cleanName.replace(new RegExp(korean, 'g'), roman);
  }
  
  let slug = cleanName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[가-힣]/g, "") // Remove remaining Korean chars
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-|-$/g, ""); // Remove leading/trailing -
  
  // Nếu slug quá ngắn, thêm prefix
  if (slug.length < 3) {
    slug = 'product-' + slug;
  }
  
  return slug || 'product';
}

// Hàm tạo slug unique
async function generateUniqueSlug(name: string, existingId?: string): Promise<string> {
  let baseSlug = generateSlug(name);
  if (!baseSlug) baseSlug = 'product';
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(existingId ? { NOT: { id: existingId } } : {}),
      },
    });
    
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

async function main() {
  console.log('Đang tìm sản phẩm cần cập nhật slug...');
  
  // Tìm tất cả sản phẩm
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  
  // Lọc sản phẩm có slug không hợp lệ (rỗng, giống id, hoặc không phải dạng slug)
  const products = allProducts.filter(p => {
    if (!p.slug || p.slug === '') return true;
    if (p.slug === p.id) return true;
    // Kiểm tra nếu slug chứa ký tự không hợp lệ
    if (/[^a-z0-9-]/.test(p.slug)) return true;
    return false;
  });
  
  console.log(`Tìm thấy ${products.length} sản phẩm cần tạo slug`);
  
  for (const product of products) {
    const newSlug = await generateUniqueSlug(product.name, product.id);
    
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: newSlug },
    });
    
    console.log(`✓ ${product.name} -> ${newSlug}`);
  }
  
  console.log('\nHoàn thành!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
