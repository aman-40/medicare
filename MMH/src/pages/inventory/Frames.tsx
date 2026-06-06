import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Frames() {
  const [frames, setFrames] = useState<any[]>([]);

  useEffect(() => {
    // We reuse the public store API but we could create an admin specific one if needed
    api.get('/store/frames').then(res => setFrames(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-healthcare-text">Frames Inventory</h1>
        <button className="bg-healthcare-blue text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Frame
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name & Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs (Material/Color)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {frames.map((frame) => (
              <tr key={frame.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{frame.name}</div>
                  <div className="text-sm text-gray-500">{frame.brand}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frame.material || 'Standard'} / {frame.color || 'Assorted'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${frame.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {frame.stock} Units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ₹{frame.price}
                </td>
              </tr>
            ))}
            {frames.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No frames found in database.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
