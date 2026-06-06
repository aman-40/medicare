import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Lenses() {
  const [lenses, setLenses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/store/lenses').then(res => setLenses(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-healthcare-text">Lenses Inventory</h1>
        <button className="bg-healthcare-blue text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Lens
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lens Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material / Specs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lenses.map((lens) => (
              <tr key={lens.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{lens.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lens.type} / {lens.material || 'Standard'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lens.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {lens.stock} Units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{lens.price}</td>
              </tr>
            ))}
            {lenses.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No lenses found in database.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
