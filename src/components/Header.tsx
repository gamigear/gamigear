"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, User, ShoppingCart, Truck, LogOut, ChevronDown, ChevronRight, Grid3X3 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";

interface MenuItem {
  id: string;
  name: string;
  href: string;
  isExternal: boolean;
  isActive: boolean;
  highlight?: boolean;
}

interface MenuData {
  topbar: MenuItem[];
  main: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  _count?: { products: number };
  children?: Category[];
}

// Default menus - will be overridden by API data
const defaultMenus: MenuData = {
  topbar: [
    { id: "1", name: "Gamigear", href: "/", isExternal: false, isActive: true },
    { id: "2", name: "Blog", href: "/blog", isExternal: false, isActive: true },
    { id: "3", name: "Liên hệ", href: "/contact", isExternal: false, isActive: true },
  ],
  main: [
    { id: "1", name: "Bán chạy", href: "/category/best", isExternal: false, isActive: true, highlight: false },
    { id: "2", name: "Sản phẩm mới", href: "/category/new", isExternal: false, isActive: true, highlight: false },
    { id: "3", name: "Khuyến mãi", href: "/category/sale", isExternal: false, isActive: true, highlight: true },
    { id: "4", name: "Blog", href: "/blog", isExternal: false, isActive: true, highlight: false },
  ],
};

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const { t } = useShopTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menus, setMenus] = useState<MenuData>(defaultMenus);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch menus from API
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setMenus(data.data);
        }
      })
      .catch(console.error);
    
    // Fetch categories for mega menu
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Get active menu items from API data
  const topMenuLinks = menus.topbar.filter((item) => item.isActive);
  const mainNavLinks = menus.main.filter((item) => item.isActive);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative w-full bg-white z-[600]">
      {/* Top Bar - Desktop Only */}
      <div className="hidden pc:block bg-black">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex h-10 items-center justify-between px-4">
            <ul className="flex items-center gap-6">
              {topMenuLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    className="text-xs text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex items-center gap-4 text-xs text-white/80">
              <li>
                <CurrencySwitcher />
              </li>
              <li className="text-white/30">|</li>
              <li>
                <LanguageSwitcher />
              </li>
              {!mounted || loading ? (
                <li className="text-white/50">...</li>
              ) : isAuthenticated && user ? (
                <>
                  <li className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <span>{user.lastName}{user.firstName}</span>
                      <ChevronDown size={14} />
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                          <Link
                            href="/mypage"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            {mounted ? t.mypage.title : "마이페이지"}
                          </Link>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            {mounted ? t.mypage.orders : "주문내역"}
                          </Link>
                          {user.role === "administrator" && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Admin
                            </Link>
                          )}
                          <hr className="my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            {mounted ? t.auth.logout : "로그아웃"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:text-white transition-colors">
                      {mounted ? t.auth.login : "로그인"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-white transition-colors">
                      {mounted ? t.auth.register : "회원가입"}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/customer" className="hover:text-white transition-colors">
                  {mounted ? t.header.customerService : "고객센터"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Header - Desktop */}
      <div className="hidden pc:block mx-auto w-full max-w-[1280px] px-4">
        <div className="flex items-center justify-between h-[92px] relative">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-black">Gamigear</h1>
          </Link>

          <div className="absolute left-[150px] top-1/2 -translate-y-1/2">
            <div className="flex items-center w-[480px] h-11 bg-gray-100 rounded-full px-4">
              <input
                type="text"
                placeholder={mounted ? t.header.searchPlaceholder : "검색어를 입력하세요"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <Search size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-7">
            <Link href="/orders" className="flex flex-col items-center text-gray-600 hover:text-black">
              <Truck size={22} />
              <span className="text-[10px] mt-1">{mounted ? t.header.orderTracking : "주문조회"}</span>
            </Link>
            <Link href="/mypage" className="flex flex-col items-center text-gray-600 hover:text-black">
              <User size={22} />
              <span className="text-[10px] mt-1">{mounted ? t.header.mypage : "마이페이지"}</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center text-gray-600 hover:text-black relative">
              <ShoppingCart size={22} />
              <span className="text-[10px] mt-1">{mounted ? t.header.cart : "장바구니"}</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center relative gap-8 mt-[33px] pb-4">
          {/* Category Mega Menu */}
          <div 
            className="category-wrap relative"
            onMouseEnter={() => setIsCategoryMenuOpen(true)}
            onMouseLeave={() => {
              setIsCategoryMenuOpen(false);
              setActiveCategory(null);
            }}
          >
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Grid3X3 size={20} />
              {mounted ? t.header.categories : "Danh mục"}
              <ChevronDown size={16} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu Dropdown - Full Width */}
            {isCategoryMenuOpen && categories.length > 0 && (
              <div className="fixed left-0 right-0 top-auto pt-2 z-50" style={{ marginTop: '0' }}>
                <div className="mx-auto w-full max-w-[1280px] px-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-full">
                  <div className="flex">
                    {/* Category List */}
                    <div className="w-[240px] bg-gray-50 border-r border-gray-100 py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                        Danh mục sản phẩm
                      </div>
                      {categories.slice(0, 10).map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                            activeCategory === category.id 
                              ? 'bg-white text-primary font-medium' 
                              : 'text-gray-700 hover:bg-white hover:text-primary'
                          }`}
                          onMouseEnter={() => setActiveCategory(category.id)}
                        >
                          <span>{category.name}</span>
                          {category.children && category.children.length > 0 && (
                            <ChevronRight size={16} className="text-gray-400" />
                          )}
                        </Link>
                      ))}
                      <Link
                        href="/categories"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-primary font-medium border-t border-gray-100 mt-2"
                      >
                        Xem tất cả danh mục
                        <ChevronRight size={16} />
                      </Link>
                    </div>

                    {/* Subcategories & Featured */}
                    <div className="flex-1 p-6">
                      {activeCategory ? (
                        <>
                          {/* Active category content */}
                          {(() => {
                            const cat = categories.find(c => c.id === activeCategory);
                            if (!cat) return null;
                            return (
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                                  <Link 
                                    href={`/category/${cat.slug}`}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    Xem tất cả →
                                  </Link>
                                </div>
                                {cat.description && (
                                  <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                                )}
                                {cat.children && cat.children.length > 0 && (
                                  <div className="grid grid-cols-3 gap-3">
                                    {cat.children.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        href={`/category/${sub.slug}`}
                                        className="p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-colors"
                                      >
                                        <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                                        {sub._count?.products !== undefined && (
                                          <span className="text-xs text-gray-400 ml-2">({sub._count.products})</span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                                {cat.image && (
                                  <div className="mt-4 rounded-lg overflow-hidden">
                                    <img 
                                      src={cat.image} 
                                      alt={cat.name}
                                      className="w-full h-32 object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        /* Default content - Featured categories 4x2 grid */
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Danh mục nổi bật</h3>
                          <div className="grid grid-cols-4 gap-4">
                            {categories.slice(0, 8).map((category) => (
                              <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all"
                              >
                                {category.image ? (
                                  <div className="w-full h-20 rounded-lg overflow-hidden mb-3 bg-gray-100">
                                    <img 
                                      src={category.image} 
                                      alt={category.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 mb-3 flex items-center justify-center">
                                    <Grid3X3 size={24} className="text-primary/50" />
                                  </div>
                                )}
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {category.name}
                                </h4>
                                {category._count?.products !== undefined && (
                                  <p className="text-xs text-gray-400 mt-1">{category._count.products} sản phẩm</p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="gnb flex gap-8">
            {mainNavLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                className="p-1.5 py-3.5 text-base font-medium text-gray-500 hover:text-black transition-colors"
              >
                {link.highlight ? (
                  <span className="relative whitespace-nowrap flex">
                    {link.name.split("").map((char, i) => (
                      <span
                        key={i}
                        className="bounce font-normal"
                        style={{
                          color: ["#FF00B1", "#9A00FF", "#02B3F6", "#66F200"][i % 4],
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="relative whitespace-nowrap">{link.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="pc:hidden">
        <div className="flex items-center justify-between h-14 px-5">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <Link href="/" className="text-lg font-bold">
            Gamigear
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={22} />
            </button>
            <Link href="/cart" className="relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className="px-5 pb-3">
            <div className="flex items-center h-10 bg-gray-100 rounded-full px-4">
              <input
                type="text"
                placeholder={mounted ? t.header.searchPlaceholder : "검색어를 입력하세요"}
                className="flex-1 bg-transparent outline-none text-sm"
                autoFocus
              />
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
        )}

        <nav className="gnb flex w-full h-full justify-evenly border-t border-gray-100 overflow-x-auto">
          {mainNavLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={link.isExternal ? "_blank" : undefined}
              className="flex-shrink-0 p-1.5 py-3.5 text-sm font-medium text-gray-500 flex items-center justify-center"
            >
              {link.highlight ? (
                <span className="relative whitespace-nowrap flex">
                  {link.name.split("").map((char, i) => (
                    <span
                      key={i}
                      className="bounce font-normal"
                      style={{
                        color: ["#FF00B1", "#9A00FF", "#02B3F6", "#66F200"][i % 4],
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="relative whitespace-nowrap">{link.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[700] pc:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white">
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <span className="font-bold">{mounted ? t.header.menu : "메뉴"}</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {isAuthenticated && user ? (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.lastName}{user.firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/mypage"
                      className="flex-1 py-2 text-center text-sm border border-gray-200 rounded"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {mounted ? t.mypage.title : "마이페이지"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2 text-center text-sm bg-gray-100 rounded flex items-center justify-center gap-1"
                    >
                      <LogOut size={14} />
                      {mounted ? t.auth.logout : "로그아웃"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mb-6">
                  <Link
                    href="/login"
                    className="flex-1 py-2 text-center text-sm border border-gray-200 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {mounted ? t.auth.login : "로그인"}
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 py-2 text-center text-sm bg-black text-white rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {mounted ? t.auth.register : "회원가입"}
                  </Link>
                </div>
              )}
              
              {/* Categories in Mobile */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Danh mục</p>
                <div className="space-y-1">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between py-2 text-sm text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{category.name}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  ))}
                  <Link
                    href="/categories"
                    className="block py-2 text-sm text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Xem tất cả →
                  </Link>
                </div>
              </div>

              <nav className="space-y-1 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Menu</p>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    className="block py-3 text-base font-medium border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {isAuthenticated && user?.role === "administrator" && (
                <Link
                  href="/admin"
                  className="block mt-4 py-3 text-base font-medium text-blue-600 border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <div className="text-gray-700">
                  <CurrencySwitcher />
                </div>
                <div className="text-gray-300">|</div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
