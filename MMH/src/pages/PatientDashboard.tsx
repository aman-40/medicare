import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '../api/axios';

export default function PatientDashboard() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/clinic/my-reports');
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch medical records');
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-healthcare-text">Patient Dashboard</h1>
        <Link to="/appointments" className="px-4 py-2 bg-healthcare-teal text-white rounded-md shadow-sm hover:bg-teal-700">
          Book Checkup
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-healthcare-blue">My Medical Records</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500 italic">No eye reports found.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Dr. {report.doctor?.user?.name || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-gray-600">Left Eye:</span> {report.leftEyePower}</div>
                  <div><span className="font-medium text-gray-600">Right Eye:</span> {report.rightEyePower}</div>
                </div>
                {report.remarks && (
                  <div className="mt-2 text-sm text-gray-600 italic">"{report.remarks}"</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <Link to="/medicines" className="flex-1 p-6 bg-blue-50 text-blue-800 rounded-xl font-semibold hover:bg-blue-100 text-center">Pharmacy</Link>
        <Link to="/optical-store" className="flex-1 p-6 bg-teal-50 text-teal-800 rounded-xl font-semibold hover:bg-teal-100 text-center">Optical Store</Link>
        <Link to="/queue" className="flex-1 p-6 bg-purple-50 text-purple-800 rounded-xl font-semibold hover:bg-purple-100 text-center">Live Queue</Link>
      </div>
    </div>
  );
}
