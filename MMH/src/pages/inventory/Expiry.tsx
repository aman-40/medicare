import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ExpiryAlerts() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/inventory/expiry').then(res => setItems(res.data)).catch(console.error);
  }, []);

  const getDaysUntil = (dateString: string) => {
    const diffTime = Math.abs(new Date(dateString).getTime() - new Date().getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRowColor = (dateString: string) => {
    const days = getDaysUntil(dateString);
    if (new Date(dateString) < new Date()) return 'bg-red-50 border-l-4 border-red-500'; // Expired
    if (days <= 30) return 'bg-orange-50 border-l-4 border-orange-500';
    return 'bg-yellow-50 border-l-4 border-yellow-500';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-healthcare-text">Expiry Management</h1>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Expired</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> &lt; 30 Days</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> &lt; 60 Days</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const days = getDaysUntil(item.expiryDate);
              const isExpired = new Date(item.expiryDate) < new Date();
              
              return (
                <tr key={item.id} className={getRowColor(item.expiryDate)}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name} <span className="text-sm text-gray-500 block">{item.company}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.batchNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isExpired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {isExpired ? 'EXPIRED' : `${days} Days Left`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock} Units</td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No items expiring within 60 days. Great job!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
