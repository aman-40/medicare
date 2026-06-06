import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Link } from 'react-router';

export default function PharmacistDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/clinic/reports/all');
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch prescriptions", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-healthcare-text">Pharmacist Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/inventory">
            <Button className="bg-healthcare-teal hover:bg-teal-700">Inventory Module</Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-healthcare-blue">Recent Eye Prescriptions</h2>
        <p className="text-sm text-gray-500 mb-6">Review the latest prescriptions to dispense medicines or direct patients to the Optical Store.</p>
        
        {loading ? (
          <p className="text-gray-500">Loading prescriptions...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500 italic">No prescriptions have been issued yet.</p>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Patient: {report.patient?.user?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500">ID: {report.patientId}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-healthcare-blue">Dr. {report.doctor?.user?.name || 'Unknown'}</span>
                    <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">Left Eye Power</span>
                    <span className="text-xl font-semibold text-blue-900">{report.leftEyePower}</span>
                  </div>
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-md">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">Right Eye Power</span>
                    <span className="text-xl font-semibold text-teal-900">{report.rightEyePower}</span>
                  </div>
                </div>
                
                {report.remarks && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Doctor's Remarks:</p>
                    <p className="text-sm text-yellow-900 italic">"{report.remarks}"</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 justify-end">
                  <Button variant="outline" className="text-sm">Mark Dispensed</Button>
                  <Button className="bg-healthcare-blue hover:bg-blue-700 text-sm">Create Bill</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
