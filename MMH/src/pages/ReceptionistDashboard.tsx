import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async (appointmentId: string) => {
    try {
      await api.post('/queue/generate', { appointmentId });
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to generate token", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-healthcare-text">Receptionist Dashboard</h1>
        <div className="text-sm bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
          Today's Schedule: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-healthcare-blue">Today's Appointments</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 italic">No appointments scheduled for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Patient</th>
                  <th className="p-4 font-semibold text-gray-700">Doctor</th>
                  <th className="p-4 font-semibold text-gray-700">Time</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{apt.patient?.user?.name || 'Unknown'}</td>
                    <td className="p-4">Dr. {apt.doctor?.user?.name || 'Unknown'}</td>
                    <td className="p-4">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4">
                      {apt.queue ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                          Token #{apt.queue.tokenNumber} ({apt.queue.status})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                          {apt.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!apt.queue && (
                        <Button 
                          onClick={() => generateToken(apt.id)}
                          className="bg-healthcare-teal hover:bg-teal-700 text-xs px-3 py-1 h-8"
                        >
                          Send to Queue
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
