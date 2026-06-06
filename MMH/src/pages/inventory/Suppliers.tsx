import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    // Stubbing fetch. In a real scenario, this fetches from /api/inventory/suppliers
    setSuppliers([
      { id: 'test1', name: 'PharmaCorp Ltd', phone: '+91 9876543210', email: 'sales@pharmacorp.in', address: 'Mumbai, MH' },
      { id: 'test2', name: 'Visionary Optics', phone: '+91 8765432109', email: 'orders@visionary.in', address: 'Delhi, DL' },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-healthcare-text">Supplier Management</h1>
        <button className="bg-healthcare-blue text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.map((sup) => (
              <tr key={sup.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sup.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>📞 {sup.phone}</div>
                  <div>✉️ {sup.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sup.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-healthcare-blue hover:text-blue-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
