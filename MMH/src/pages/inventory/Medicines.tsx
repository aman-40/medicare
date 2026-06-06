import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import MedicineTable from '../../components/inventory/MedicineTable';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicines');
        setMedicines(response.data);
      } catch (error) {
        console.error('Failed to fetch medicines', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-healthcare-text">Medicine Inventory</h1>
        <button className="bg-healthcare-blue text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Medicine
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-4">
        <input type="text" placeholder="Search medicine name..." className="flex-1 border rounded px-3 py-2" />
        <select className="border rounded px-3 py-2">
          <option>All Categories</option>
          <option>Tablet</option>
          <option>Syrup</option>
          <option>Injection</option>
        </select>
        <button className="bg-gray-100 px-4 py-2 rounded text-gray-700 hover:bg-gray-200">Filter</button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading inventory...</div>
      ) : (
        <MedicineTable data={medicines} />
      )}
    </div>
  );
}
