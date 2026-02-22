import { Link } from 'react-router-dom';
import { Facebook, Twitter, Github, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white mb-6 block">
              DigiForest
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              The world's leading marketplace for premium digital assets. Buy and sell themes, scripts, and graphics with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Github className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Marketplace</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">All Items</Link></li>
              <li><Link to="/?category=Themes" className="hover:text-emerald-500 transition-colors">WordPress Themes</Link></li>
              <li><Link to="/?category=Scripts" className="hover:text-emerald-500 transition-colors">PHP Scripts</Link></li>
              <li><Link to="/?category=Graphics" className="hover:text-emerald-500 transition-colors">Graphic Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Author Terms</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">License Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Newsletter</h3>
            <p className="text-sm mb-4">Get the latest updates on new items and discounts.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-slate-800 border-none rounded-l-lg py-2 px-4 text-sm focus:ring-1 focus:ring-emerald-500 w-full"
              />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-r-lg hover:bg-emerald-700 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© 2026 DigiForest Marketplace. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
