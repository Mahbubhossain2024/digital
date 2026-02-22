import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Star, Download, ShieldCheck, Zap, ShoppingCart } from 'lucide-react';

import { CATEGORIES } from '../constants';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  sales_count: number;
  demo_url?: string;
  author_name?: string;
}

interface Banner {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/banners').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([productsData, bannersData, categoriesData]) => {
      setProducts(productsData);
      setBanners(bannersData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category === categoryFilter)
    : products;

  return (
    <div className="pb-20">
      {/* Hero Section / Slider */}
      <section className="relative bg-slate-900 min-h-[500px] flex items-center overflow-hidden">
        {banners.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentBanner ? 1 : 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
                  <div className="max-w-4xl">
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: index === currentBanner ? 0 : 20, opacity: index === currentBanner ? 1 : 0 }}
                      className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: index === currentBanner ? 0 : 20, opacity: index === currentBanner ? 1 : 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-slate-200 text-lg md:text-xl mb-10"
                    >
                      {banner.subtitle}
                    </motion.p>
                    <Link 
                      to={banner.link}
                      className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all inline-block"
                    >
                      Explore Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981,transparent_50%)]"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
              >
                Premium Digital Assets for <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Your Next Big Project
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
              >
                Discover thousands of high-quality themes, scripts, and graphics created by world-class authors.
              </motion.p>
            </div>
          </>
        )}
      </section>

      {/* Categories Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4 no-scrollbar">
            <Link 
              to="/"
              className={`whitespace-nowrap text-sm font-semibold transition-colors ${
                !categoryFilter
                  ? 'text-emerald-600 border-b-2 border-emerald-600 pb-4 -mb-4'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Items
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/?category=${cat.name}`}
                className={`whitespace-nowrap text-sm font-semibold transition-colors ${
                  categoryFilter === cat.name
                    ? 'text-emerald-600 border-b-2 border-emerald-600 pb-4 -mb-4'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Category Section */}
      {!categoryFilter && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Browse by Category</h2>
              <p className="text-slate-600 dark:text-slate-400">Find exactly what you need from our curated collections</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.name}`}
                  className="group p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-center shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {categoryFilter ? `${categoryFilter} Items` : 'Featured Items'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Hand-picked premium assets for you</p>
          </div>
          <Link to="/" className="text-emerald-600 font-semibold text-sm flex items-center gap-1 hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-80 border border-slate-200 dark:border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={product.thumbnail || `https://picsum.photos/seed/${product.id}/800/500`} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay for hover effect if needed */}
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`} className="block text-base font-bold text-slate-800 dark:text-white hover:text-emerald-600 transition-colors mb-1 line-clamp-1">
                    {product.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    by <span className="hover:underline cursor-pointer">{product.author_name || 'DigiForest'}</span> in <span className="hover:underline cursor-pointer">{product.category}</span>
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ৳{product.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                        <span className="text-[10px] text-slate-400">(4.9)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {product.sales_count} Sales
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/checkout/${product.id}`}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </Link>
                      <a 
                        href={product.demo_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-2 border border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        Live Preview
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 mt-24 py-20 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Choose DigiForest?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">We provide the best experience for both buyers and sellers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Secure Transactions</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Your payments are protected with industry-leading encryption and security protocols.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Instant Delivery</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Get your digital products immediately after successful payment. No waiting time.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Quality Assets</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Every item in our marketplace is reviewed by our team to ensure the highest quality standards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
