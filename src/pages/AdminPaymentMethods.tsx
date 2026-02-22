import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Edit, Loader2, X, CheckCircle2, AlertCircle, ShieldCheck, Zap, Smartphone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'manual' | 'auto';
  account_number?: string;
  instructions?: string;
  api_key?: string;
  api_secret?: string;
  active: number;
}

export default function AdminPaymentMethods() {
  const { token } = useAuthStore();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = () => {
    fetch('/api/admin/payment-methods', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMethods(data);
        setLoading(false);
      });
  };

  const handleOpenModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({ ...method });
    setIsModalOpen(true);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch(`/api/admin/payment-methods/${editingMethod?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save payment method');

      setSuccess(true);
      fetchMethods();
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Gateways</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure bKash, Nagad, and Rocket (Manual/Auto)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white dark:bg-slate-900 p-8 rounded-3xl border ${method.active ? 'border-emerald-500/30' : 'border-slate-200 dark:border-slate-800'} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
            {!method.active && <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 z-10"></div>}
            
            <div className="flex justify-between items-start mb-6 relative z-20">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                method.id === 'bkash' ? 'bg-pink-100 text-pink-600' : 
                method.id === 'nagad' ? 'bg-orange-100 text-orange-600' : 
                'bg-purple-100 text-purple-600'
              }`}>
                <Smartphone className="h-8 w-8" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                method.type === 'auto' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {method.type}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-20">{method.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-20">
              {method.type === 'manual' ? `Account: ${method.account_number}` : 'Automatic API Integration'}
            </p>

            <button 
              onClick={() => handleOpenModal(method)}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all relative z-20"
            >
              Configure Gateway
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Configure {editingMethod?.name}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Gateway settings saved!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'manual' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'auto' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'auto' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}
                >
                  Automatic
                </button>
              </div>

              {formData.type === 'manual' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instructions</label>
                    <textarea
                      rows={3}
                      value={formData.instructions || ''}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                      placeholder="Payment instructions for the user..."
                    ></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">API Key</label>
                    <input
                      type="password"
                      value={formData.api_key || ''}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">API Secret</label>
                    <input
                      type="password"
                      value={formData.api_secret || ''}
                      onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active === 1}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable this Gateway</label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Gateway Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
