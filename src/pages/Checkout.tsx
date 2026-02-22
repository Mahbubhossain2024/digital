import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState(1); // 1: Payment Info, 2: Confirmation

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([productData, settingsData]) => {
      setProduct(productData);
      setSettings(settingsData);
      setLoading(false);
    });
  }, [id]);

  const handlePayment = async () => {
    if (!transactionId) return alert('Please enter Transaction ID');
    setProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: id, 
          paymentMethod, 
          transactionId 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {step === 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
              {settings?.payment_mode === 'auto' ? (
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" /> Automatic Payment
                  </h3>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Automatic payments are currently in sandbox mode.</p>
                    <button 
                      onClick={() => {
                        setTransactionId('AUTO_' + Math.random().toString(36).substr(2, 9).toUpperCase());
                        setTimeout(handlePayment, 500);
                      }}
                      className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Pay with Card (Demo)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-600" /> Select Payment Method
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'bkash', name: 'bKash', color: 'bg-pink-500' },
                      { id: 'nagad', name: 'Nagad', color: 'bg-orange-500' },
                      { id: 'rocket', name: 'Rocket', color: 'bg-purple-600' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          paymentMethod === method.id 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full ${method.color} flex items-center justify-center text-white font-bold text-xs`}>
                          {method.name[0]}
                        </div>
                        <span className="font-bold text-slate-700">{method.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8">
                    <h4 className="font-bold text-slate-900 mb-4">Payment Instructions:</h4>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap mb-4">
                      {settings?.manual_payment_details || 'Please contact admin for payment details.'}
                    </div>
                    <ol className="text-sm text-slate-600 space-y-3 list-decimal ml-4">
                      <li>Go to your {paymentMethod} app or dial USSD code.</li>
                      <li>Follow the instructions above.</li>
                      <li>Enter Amount: <span className="font-bold text-slate-900">${product.price}</span></li>
                      <li>Enter Reference: <span className="font-bold text-slate-900">Order #{id}</span></li>
                      <li>After successful payment, enter the Transaction ID below.</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction ID</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 8N7A6D5C4B"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Purchase'}
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-28">
              <h3 className="font-bold text-slate-900 mb-6">Order Summary</h3>
              <div className="flex gap-4 mb-6">
                <img src={product.thumbnail} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{product.title}</h4>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Item Price</span>
                  <span className="text-slate-900 font-medium">${product.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (0%)</span>
                  <span className="text-slate-900 font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-100">
                  <span className="text-slate-900">Total</span>
                  <span className="text-emerald-600">${product.price}</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Checkout
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
          <p className="text-slate-500 text-lg mb-10">
            Thank you for your purchase. Your digital product is now ready for download.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/my-orders')}
              className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              Go to My Downloads
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
