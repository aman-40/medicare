import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { io } from 'socket.io-client';

export default function DoctorDashboard() {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [leftEyePower, setLeftEyePower] = useState('');
  const [rightEyePower, setRightEyePower] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('');
  
  const [queue, setQueue] = useState<any[]>([]);
  const [currentToken, setCurrentToken] = useState<number | null>(null);

  useEffect(() => {
    fetchQueue();

    // Connect to websocket for live updates
    const socket = io('http://localhost:5000');
    socket.on('queue-updated', (data) => {
      fetchQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/queue');
      setQueue(response.data.queueItems);
      setCurrentToken(response.data.currentToken);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    }
  };

  const callNextPatient = async () => {
    try {
      const response = await api.post('/queue/next');
      // The response returns the called patient token. We should ideally fetch the patient ID
      // but for now, we will just prompt the doctor that they can start.
      // A more robust implementation would return the full appointment details from `/next`.
      // Let's refetch the queue to update the UI.
      fetchQueue();
      setStatus(`Called Token #${response.data.calledToken}. Please enter their Patient ID below to begin.`);
      setPatientId('');
      setPatientName('');
    } catch (error: any) {
      setStatus(error.response?.data?.message || 'Failed to call next patient. Queue might be empty.');
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clinic/report', {
        patientId,
        leftEyePower,
        rightEyePower,
        remarks
      });
      setStatus('Eye report successfully submitted!');
      setPatientId(''); setPatientName(''); setLeftEyePower(''); setRightEyePower(''); setRemarks('');
    } catch (error) {
      setStatus('Failed to submit report. Please check the patient ID.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-healthcare-text mb-6">Doctor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Live Queue */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 bg-purple-50">
            <h2 className="text-xl font-bold mb-2 text-purple-800">Live Waiting Queue</h2>
            <div className="text-4xl font-extrabold text-purple-600 mb-4">
              {currentToken ? `Token #${currentToken}` : 'Empty'}
            </div>
            
            <Button 
              onClick={callNextPatient} 
              disabled={queue.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
            >
              Call Next Patient
            </Button>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Up Next ({queue.length})</h3>
              <ul className="space-y-2">
                {queue.map(q => (
                  <li key={q.id} className="flex justify-between p-3 bg-white rounded-md shadow-sm border border-gray-100">
                    <span className="font-bold text-gray-700">Token #{q.tokenNumber}</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{q.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Prescription Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-healthcare-blue">Submit Eye Prescription</h2>
            
            {status && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 font-medium">
                {status}
              </div>
            )}

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Database ID</label>
                <input required type="text" placeholder="Enter Patient ID (e.g. cm0...)" value={patientId} onChange={(e) => setPatientId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-healthcare-blue focus:ring-healthcare-blue" />
                <p className="text-xs text-gray-500 mt-1">Ask the patient for their ID from their dashboard.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Left Eye Power</label>
                  <input required type="text" placeholder="-1.50" value={leftEyePower} onChange={(e) => setLeftEyePower(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Right Eye Power</label>
                  <input required type="text" placeholder="-1.25" value={rightEyePower} onChange={(e) => setRightEyePower(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks / Prescription details</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-healthcare-blue focus:ring-healthcare-blue" rows={4} placeholder="E.g., Prescribe progressive lenses, avoid screen time..."></textarea>
              </div>
              <Button type="submit" className="w-full bg-healthcare-blue text-white rounded-md hover:bg-blue-700 transition py-6 text-lg font-bold">
                Submit & Sign Prescription
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
