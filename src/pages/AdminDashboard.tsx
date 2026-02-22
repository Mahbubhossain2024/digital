import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, Package, TrendingUp, ArrowUpRight, Clock, Loader2, UserPlus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function AdminDashboard() {
  const { token, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        if (res.status === 401 || res.status === 403) {
          logout();
          throw new Error('Unauthorized access. Please login again.');
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard Fetch Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [token, logout]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Loading dashboard data...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md">
        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const statCards = [
    { title: 'Total Revenue', value: `$${(stats?.revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Total Orders', value: stats?.orders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Products', value: stats?.products || 0, icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const chartData = stats?.salesTrend?.length > 0 
    ? stats.salesTrend.map((item: any) => ({
        name: format(new Date(item.date), 'MMM dd'),
        sales: item.total
      }))
    : [
        { name: 'No Data', sales: 0 }
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your marketplace performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} dark:bg-slate-800`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <span className="text-emerald-500 flex items-center text-xs font-bold">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" /> Sales Analytics
            </h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 dark:text-white">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" /> Recent Orders
          </h3>
          <div className="space-y-6">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs shrink-0">
                  {order.user_name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.product_title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{order.user_name} • {format(new Date(order.created_at), 'HH:mm')}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${order.amount}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/orders" className="w-full mt-8 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-t border-slate-100 dark:border-slate-800 block text-center">
            View All Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" /> Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.categoryDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(stats?.categoryDistribution || []).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Top Selling Products
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Recent User Activity
          </h3>
          <div className="space-y-6">
            {stats.recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{format(new Date(user.created_at), 'MMM dd')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health / Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" /> Platform Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg. Order Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                ${stats.orders > 0 ? (stats.revenue / stats.orders).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Conversion Rate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3.2%</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active Sessions</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">124</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Server Uptime</p>
              <p className="text-xl font-bold text-emerald-600">99.9%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
