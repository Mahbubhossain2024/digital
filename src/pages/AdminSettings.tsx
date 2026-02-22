import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Save, Upload, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Plus, Trash2, Globe, CreditCard } from 'lucide-react';

interface Banner {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  active: number;
}

export default function AdminSettings() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    site_logo: '',
    site_favicon: '',
    payment_mode: 'manual',
    manual_payment_details: '',
  });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [settingsRes, bannersRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/admin/banners', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const settingsData = await settingsRes.json();
      const bannersData = await bannersRes.json();
      
      setSettings(settingsData);
      setBanners(bannersData);
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'site_logo' | 'site_favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (key === 'site_logo') setUploadingLogo(true);
    else setUploadingFavicon(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSettings(prev => ({ ...prev, [key]: data.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
      setUploadingFavicon(false);
    }
  };

  const handleAddBanner = async () => {
    const newBanner = {
      image_url: 'https://picsum.photos/seed/new/1920/600',
      title: 'New Banner',
      subtitle: 'Banner description here',
      link: '/'
    };

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBanner),
      });
      if (res.ok) fetchData();
    } catch (err) {
      setError('Failed to add banner');
    }
  };

  const handleUpdateBanner = async (id: number, updates: Partial<Banner>) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...banner, ...updates }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      setError('Failed to update banner');
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch (err) {
      setError('Failed to delete banner');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Site Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your marketplace branding, banners, and payments</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding & Payments */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" /> Branding
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Site Logo</label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="relative h-20 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden"
                >
                  {settings.site_logo ? (
                    <img src={settings.site_logo} alt="Logo" className="h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center">
                      {uploadingLogo ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <Upload className="h-5 w-5 text-slate-400" />}
                      <span className="text-[10px] text-slate-500 mt-1">Upload Logo</span>
                    </div>
                  )}
                  <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'site_logo')} className="hidden" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Favicon</label>
                <div 
                  onClick={() => faviconInputRef.current?.click()}
                  className="relative h-16 w-16 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden"
                >
                  {settings.site_favicon ? (
                    <img src={settings.site_favicon} alt="Favicon" className="h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center">
                      {uploadingFavicon ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <Upload className="h-5 w-5 text-slate-400" />}
                    </div>
                  )}
                  <input type="file" ref={faviconInputRef} onChange={(e) => handleFileUpload(e, 'site_favicon')} className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" /> Payment Config
            </h2>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Mode</label>
                <select 
                  value={settings.payment_mode}
                  onChange={(e) => setSettings({ ...settings, payment_mode: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                >
                  <option value="manual">Manual (BKash/Nagad/Rocket)</option>
                  <option value="auto">Automatic (Stripe/SSLCommerz)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Details</label>
                <textarea 
                  rows={4}
                  value={settings.manual_payment_details}
                  onChange={(e) => setSettings({ ...settings, manual_payment_details: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white text-sm"
                  placeholder="Enter manual payment instructions..."
                />
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Settings
              </button>
            </form>
          </section>
        </div>

        {/* Banners */}
        <div className="lg:col-span-2">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-600" /> Slider Banners
              </h2>
              <button 
                onClick={handleAddBanner}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Banner
              </button>
            </div>

            <div className="space-y-6">
              {banners.map((banner) => (
                <div key={banner.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                      <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Title"
                        value={banner.title}
                        onChange={(e) => handleUpdateBanner(banner.id, { title: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Subtitle"
                        value={banner.subtitle}
                        onChange={(e) => handleUpdateBanner(banner.id, { subtitle: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Image URL"
                        value={banner.image_url}
                        onChange={(e) => handleUpdateBanner(banner.id, { image_url: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Link"
                        value={banner.link}
                        onChange={(e) => handleUpdateBanner(banner.id, { link: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={banner.active === 1}
                        onChange={(e) => handleUpdateBanner(banner.id, { active: e.target.checked ? 1 : 0 })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Active</span>
                    </label>
                    <button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
