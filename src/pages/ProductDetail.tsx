import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Star, Download, ShieldCheck, Zap, ArrowLeft, CheckCircle2, Globe, FileCode, Layout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-emerald-600">Marketplace</Link>
            <span>/</span>
            <Link to={`/?category=${product.category}`} className="hover:text-emerald-600">{product.category}</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Content */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="aspect-video relative">
                <img 
                  src={product.thumbnail || `https://picsum.photos/seed/${product.id}/1200/800`} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{product.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                      by <span className="text-emerald-600 font-bold">{product.author_name || 'DigiForest'}</span> in <span className="text-emerald-600 font-bold">{product.category}</span>
                    </p>
                  </div>
                  {product.demo_url && (
                    <a 
                      href={product.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center gap-2"
                    >
                      <Globe className="h-5 w-5" /> Live Preview
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Layout className="h-4 w-4 text-emerald-500" /> {product.category}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Download className="h-4 w-4 text-emerald-500" /> {product.sales_count} Sales
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Star className="h-4 w-4 text-amber-500" /> 4.9 Rating
                  </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                   <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Product Description</h3>
                   <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown>{product.description}</ReactMarkdown>
                   </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Quality Verified
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500/80">This item has been manually reviewed and verified by our quality assurance team.</p>
                  </div>
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <Zap className="h-5 w-5" /> Instant Access
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-500/80">Download your files immediately after purchase. Lifetime updates included.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Regular License</span>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">${product.price}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    Quality checked by DigiForest
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    Future updates included
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    6 months support from author
                  </li>
                </ul>

                <Link 
                  to={`/checkout/${product.id}`}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none mb-4"
                >
                  <ShoppingCart className="h-5 w-5" /> Buy Now
                </Link>
                
                <p className="text-center text-xs text-slate-400">
                  Secure payment via bKash, Nagad, or Rocket
                </p>
              </motion.div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Item Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Released</span>
                    <span className="text-slate-900 dark:text-white font-medium">Feb 20, 2026</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Last Update</span>
                    <span className="text-slate-900 dark:text-white font-medium">Today</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Files Included</span>
                    <span className="text-slate-900 dark:text-white font-medium">PHP, HTML, CSS, JS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Documentation</span>
                    <span className="text-slate-900 dark:text-white font-medium">Well Documented</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
