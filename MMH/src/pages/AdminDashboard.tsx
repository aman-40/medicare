import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';

interface AdminStats {
  doctors: number;
  patients: number;
  lowStockAlerts: number;
  dailyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats. Are you an Admin?');
      }
    };
    fetchStats();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-healthcare-text mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name || 'Administrator'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-healthcare-blue/10">
            <h3 className="text-gray-500 text-sm font-medium">Total Doctors</h3>
            <p className="text-3xl font-bold text-healthcare-blue mt-2">{stats?.doctors ?? '-'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-healthcare-blue/10">
            <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
            <p className="text-3xl font-bold text-healthcare-teal mt-2">{stats?.patients ?? '-'}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-healthcare-blue/10">
            <h3 className="text-gray-500 text-sm font-medium">Inventory Alerts</h3>
            <p className={`text-3xl font-bold mt-2 ${stats?.lowStockAlerts && stats.lowStockAlerts > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {stats?.lowStockAlerts ?? '-'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-healthcare-blue/10">
            <h3 className="text-gray-500 text-sm font-medium">Today's Revenue (INR)</h3>
            <p className="text-3xl font-bold text-healthcare-text mt-2">
              ₹ {stats?.dailyRevenue?.toLocaleString() ?? '-'}
            </p>
          </div>
        </div>

        {/* Future expansion area for data tables */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-healthcare-text">Add New Doctor</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await api.post('/admin/doctors', {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  specialization: formData.get('specialization')
                });
                alert('Doctor profile successfully created! They can now log in.');
                (e.target as HTMLFormElement).reset();
              } catch (err) {
                alert('Failed to add doctor.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required name="name" type="text" placeholder="Sarah Wilson" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Login</label>
                  <input required name="email" type="email" placeholder="sarah@clinic.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                  <input required name="password" type="password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input required name="specialization" type="text" placeholder="Senior Optometrist" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-healthcare-blue text-white rounded-md hover:bg-blue-700 transition font-bold">
                Create Doctor Account
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-healthcare-blue">Add New Frame (Inventory)</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await api.post('/store/frames', {
                  name: formData.get('name'),
                  brand: formData.get('brand'),
                  purchasePrice: formData.get('purchasePrice'),
                  sellingPrice: formData.get('sellingPrice'),
                  stock: formData.get('stock')
                });
                alert('Frame added successfully!');
                (e.target as HTMLFormElement).reset();
              } catch (err) {
                alert('Failed to add frame.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Model Name</label>
                <input required name="name" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input required name="brand" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Qty</label>
                  <input required name="stock" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price (INR)</label>
                  <input required name="purchasePrice" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price (INR)</label>
                  <input required name="sellingPrice" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                + Add Frame to Database
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
