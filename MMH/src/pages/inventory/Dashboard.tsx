import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface DashboardStats {
  totalMedicines: number;
  totalFrames: number;
  totalLenses: number;
  lowStockItems: number;
  expiringSoon: number;
  todaysPurchases: number;
  todaysSales: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/inventory/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading metrics...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-healthcare-text mb-8">Inventory Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Medicines" value={stats.totalMedicines} color="bg-blue-50" textColor="text-blue-700" />
        <StatCard title="Total Frames" value={stats.totalFrames} color="bg-indigo-50" textColor="text-indigo-700" />
        <StatCard title="Total Lenses" value={stats.totalLenses} color="bg-purple-50" textColor="text-purple-700" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} color="bg-red-50" textColor="text-red-700" highlight={stats.lowStockItems > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Expiring (< 60 Days)" value={stats.expiringSoon} color="bg-orange-50" textColor="text-orange-700" highlight={stats.expiringSoon > 0} />
        <StatCard title="Today's Purchases" value={`₹ ${stats.todaysPurchases.toLocaleString()}`} color="bg-emerald-50" textColor="text-emerald-700" />
        <StatCard title="Today's Sales" value={`₹ ${stats.todaysSales.toLocaleString()}`} color="bg-teal-50" textColor="text-teal-700" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color, textColor, highlight = false }: { title: string, value: string | number, color: string, textColor: string, highlight?: boolean }) {
  return (
    <div className={`${color} rounded-xl p-6 border ${highlight ? 'border-red-300 shadow-sm' : 'border-transparent'}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${textColor} opacity-80`}>{title}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
