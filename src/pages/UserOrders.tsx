import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Download, ExternalLink, Package, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: number;
  title: string;
  thumbnail: string;
  amount: number;
  status: string;
  payment_method: string;
  file_url: string;
  created_at: string;
}

export default function UserOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Downloads</h1>
          <p className="text-slate-500 mt-1">Access all your purchased digital products</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No purchases yet</h3>
          <p className="text-slate-500 mb-8">Start exploring our marketplace to find amazing assets.</p>
          <a href="/" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <img src={order.thumbnail} alt="" className="h-24 w-32 rounded-2xl object-cover shrink-0" />
              
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{order.title}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {order.status}</span>
                  <span className="uppercase font-bold text-xs text-slate-400">{order.payment_method}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <a 
                  href={order.file_url || '#'} 
                  target="_blank"
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" /> Download Files
                </a>
                <a 
                  href={`/product/${order.id}`} // Assuming product ID is same for now or link to detail
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" /> View Item
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
