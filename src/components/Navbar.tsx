import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_logo) setLogo(data.site_logo);
        if (data.site_favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.site_favicon;
        }
      });
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <>
      {/* Top Bar with Payment Methods */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supported Payments:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded border border-pink-100 dark:border-pink-800">
                <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                <span className="text-[9px] font-bold text-pink-600 dark:text-pink-400">bKash</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400">Nagad</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400">Rocket</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>24/7 Support</span>
            <span className="h-3 w-px bg-slate-200 dark:bg-slate-800"></span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {logo ? (
                <img src={logo} alt="DigiForest" className="h-8 w-auto" />
              ) : (
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  DigiForest
                </span>
              )}
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium">All Items</Link>
              <Link to="/?category=Themes" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium">Themes</Link>
              <Link to="/?category=Scripts" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium">Scripts</Link>
              <Link to="/?category=Graphics" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium">Graphics</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 px-4 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 w-64 transition-all dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                <Link to="/my-orders" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                      {user.name[0]}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <Link to="/my-orders" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">My Downloads</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Site Settings</Link>
                    )}
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-medium">Sign In</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-1">
          <Link to="/" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">All Items</Link>
          <Link to="/?category=Themes" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Themes</Link>
          <Link to="/?category=Scripts" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Scripts</Link>
          {user ? (
            <>
              <Link to="/my-orders" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">My Downloads</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
                Logout
              </button>
            </>
          ) : (
            <div className="pt-4 space-y-2">
              <Link to="/login" className="block w-full text-center py-2 text-slate-700 font-medium border border-slate-200 rounded-md">Sign In</Link>
              <Link to="/register" className="block w-full text-center py-2 bg-emerald-600 text-white font-medium rounded-md">Create Account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
    </>
  );
}
