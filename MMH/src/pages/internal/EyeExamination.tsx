import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Eye, Save, Printer } from "lucide-react";
import api from "../../api/axios";

export default function EyeExamination() {
  const [servingPatients, setServingPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  
  // Standard fields
  const [rightSph, setRightSph] = useState('');
  const [rightCyl, setRightCyl] = useState('');
  const [rightAxis, setRightAxis] = useState('');
  const [leftSph, setLeftSph] = useState('');
  const [leftCyl, setLeftCyl] = useState('');
  const [leftAxis, setLeftAxis] = useState('');
  const [addPower, setAddPower] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt Fields
  const [reportData, setReportData] = useState({
    pupil: '',
    cornea: '',
    chiefComplaint: '',
    va: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServingPatients();
  }, []);

  const fetchServingPatients = async () => {
    try {
      const res = await api.get('/queue');
      const serving = res.data.queueItems
        .filter((q: any) => q.status === 'Serving')
        .map((q: any) => ({ ...q.patient, queueId: q.id }));
      setServingPatients(serving);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    }
  };

  const handleReportDataChange = (path: string[], value: any) => {
    setReportData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return alert("Please select a patient.");
    setLoading(true);
    try {
      await api.post('/clinic/report', { 
        patientId: selectedPatientId, 
        rightSph, rightCyl, rightAxis, leftSph, leftCyl, leftAxis, addPower, notes,
        reportData 
      });
      
      const selectedPatient = servingPatients.find(p => p.id === selectedPatientId);
      if (selectedPatient && selectedPatient.queueId) {
        await api.put(`/queue/${selectedPatient.queueId}/status`, { status: 'Completed' });
      }
      
      // Print the report before clearing the form state
      window.print();
      
      alert("Eye Examination Report saved successfully!");
      
      // Reset form
      setRightSph(''); setRightCyl(''); setRightAxis('');
      setLeftSph(''); setLeftCyl(''); setLeftAxis(''); setAddPower(''); setNotes('');
      setReportData({
        pupil: '', cornea: '', chiefComplaint: '', va: ''
      });
      setSelectedPatientId("");
      fetchServingPatients();
    } catch (error) {
      console.error("Failed to save report", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = servingPatients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <Eye className="w-8 h-8 mr-3 text-blue-600" />
          Eye Examination Details
        </h1>
      </div>

      <Card className="border-2 border-slate-200 shadow-sm print:hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle>Medical Eye Report</CardTitle>
          <CardDescription>Comprehensive optometry evaluation form.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Selection */}
            <div className="space-y-2 max-w-md">
              <Label className="text-lg font-bold text-slate-800">Currently Serving Patient <span className="text-red-500">*</span></Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="border-2 border-blue-200">
                  <SelectValue placeholder="Select a patient from the queue..." />
                </SelectTrigger>
                <SelectContent>
                  {servingPatients.length === 0 && (
                    <div className="p-2 text-sm text-slate-500">No patients are currently 'Serving' in the Queue.</div>
                  )}
                  {servingPatients.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.patientCode} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <Label>Chief Complaint (C/o)</Label>
                <Input value={reportData.chiefComplaint} onChange={e => handleReportDataChange(['chiefComplaint'], e.target.value)} placeholder="e.g., Blurry vision" />
              </div>
              <div className="space-y-2">
                <Label>Visual Acuity (V/A)</Label>
                <Input value={reportData.va} onChange={e => handleReportDataChange(['va'], e.target.value)} placeholder="e.g., 6/6" />
              </div>
              <div className="space-y-2">
                <Label>Pupil</Label>
                <Input value={reportData.pupil} onChange={e => handleReportDataChange(['pupil'], e.target.value)} placeholder="e.g., Normal" />
              </div>
              <div className="space-y-2">
                <Label>Cornea</Label>
                <Input value={reportData.cornea} onChange={e => handleReportDataChange(['cornea'], e.target.value)} placeholder="e.g., Clear" />
              </div>
            </div>

            {/* Rx Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
              <div className="space-y-4 border rounded-xl p-6 bg-blue-50/50">
                <h3 className="font-bold text-lg border-b pb-2 text-blue-800">Right Eye (OD)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>SPH</Label><Input value={rightSph} onChange={e => setRightSph(e.target.value)} placeholder="+0.00" /></div>
                  <div className="space-y-2"><Label>CYL</Label><Input value={rightCyl} onChange={e => setRightCyl(e.target.value)} placeholder="-0.00" /></div>
                  <div className="space-y-2"><Label>AXIS</Label><Input value={rightAxis} onChange={e => setRightAxis(e.target.value)} placeholder="180" /></div>
                </div>
              </div>

              <div className="space-y-4 border rounded-xl p-6 bg-emerald-50/50">
                <h3 className="font-bold text-lg border-b pb-2 text-emerald-800">Left Eye (OS)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>SPH</Label><Input value={leftSph} onChange={e => setLeftSph(e.target.value)} placeholder="+0.00" /></div>
                  <div className="space-y-2"><Label>CYL</Label><Input value={leftCyl} onChange={e => setLeftCyl(e.target.value)} placeholder="-0.00" /></div>
                  <div className="space-y-2"><Label>AXIS</Label><Input value={leftAxis} onChange={e => setLeftAxis(e.target.value)} placeholder="180" /></div>
                </div>
              </div>
            </div>
            
            {/* ADD Power (Since it applies to both) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="max-w-xs space-y-2">
                <Label className="font-bold">ADD Power</Label>
                <Input value={addPower} onChange={e => setAddPower(e.target.value)} placeholder="+2.00" />
              </div>
            </div>



            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Label>General Notes & Remarks</Label>
              <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="General comments..." />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button disabled={loading} type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                <Printer className="w-5 h-5 mr-2" />
                {loading ? "Saving..." : "Save & Print Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- HIDDEN PRE-FILLED PRINT TEMPLATE --- */}
      {selectedPatientId && (
        <div className="hidden print:flex flex-col fixed inset-0 w-full h-full bg-white text-black text-sm font-sans z-[9999]">
          
          {/* HEADER */}
          <div className="flex flex-col mb-4 pt-4">
            <div className="text-right text-xs font-bold mb-1 mr-4">Mob.: 7643955517, 8340508210</div>
            <div className="flex justify-between items-center px-4">
              <Eye className="w-12 h-12 text-blue-900" />
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide uppercase">PRIYANSHI EYE CARE CENTRE</h1>
                <p className="text-sm font-bold text-blue-900 mt-1">BETTER VISION, BEAUTIFUL LIFE</p>
                <p className="text-xs text-blue-900 mt-1">New Manoj Medical Hall, P.G. Road, Makhdumpur, Jehanabad</p>
              </div>
              <Eye className="w-12 h-12 text-blue-900" />
            </div>
            <div className="border-b-2 border-blue-900 mt-2 mx-2"></div>
            <div className="border-b border-blue-900 mt-[2px] mx-2"></div>
          </div>

          {/* PATIENT DETAILS */}
          <div className="px-6 py-2">
            <div className="flex justify-between items-end mb-4 text-[15px]">
              <div className="flex-1 flex items-end">
                <span className="font-semibold mr-2">Name</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 uppercase">{selectedPatient?.name}</span>
              </div>
              <div className="w-48 flex items-end ml-4">
                <span className="font-semibold mr-2">Age/Sex</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center uppercase">{selectedPatient?.age || '    '} / {selectedPatient?.gender?.charAt(0) || '    '}</span>
              </div>
            </div>
            <div className="flex justify-end text-[15px]">
              <div className="w-64 flex items-end">
                <span className="font-semibold mr-2">Date</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* CLINICAL BODY */}
          <div className="flex px-6 mt-8 flex-1">
            {/* Left Column */}
            <div className="w-1/2 flex flex-col space-y-12">
              <div className="flex items-center text-xl font-bold">
                <div className="flex flex-col items-center mr-2 leading-none">
                  <span>V</span>
                  <span>A</span>
                </div>
                <span className="text-4xl text-blue-900 font-light">&lt;</span>
                <span className="ml-4 text-lg font-normal">{reportData.va}</span>
              </div>
              <div className="flex items-center text-xl font-bold">
                <span className="mr-2">Pupil</span>
                <span className="text-4xl text-blue-900 font-light">&lt;</span>
                <span className="ml-4 text-lg font-normal">{reportData.pupil}</span>
              </div>
              <div className="flex items-center text-xl font-bold">
                <span className="mr-2">Cornea</span>
                <span className="text-4xl text-blue-900 font-light">&lt;</span>
                <span className="ml-4 text-lg font-normal">{reportData.cornea}</span>
              </div>
            </div>
            {/* Right Column */}
            <div className="w-1/2 pt-4">
              <div className="flex">
                <span className="text-xl font-bold mr-2">C/o -</span>
                <span className="text-lg flex-1 mt-1">{reportData.chiefComplaint}</span>
              </div>
            </div>
          </div>

          {/* PRESCRIPTION TABLE */}
          <div className="px-10 w-full mb-8">
            <h3 className="text-center font-bold text-blue-900 text-lg mb-1">N.V./CONSTANT VALUE</h3>
            <table className="w-full border-collapse border-2 border-blue-900 text-center">
              <thead>
                <tr>
                  <th className="border border-blue-900 p-2 w-16 bg-white"></th>
                  <th className="border border-blue-900 p-2 font-bold text-blue-900" colSpan={3}>Right Eye</th>
                  <th className="border border-blue-900 p-2 font-bold text-blue-900" colSpan={3}>Left Eye</th>
                </tr>
                <tr className="text-sm font-bold text-blue-900">
                  <td className="border border-blue-900 p-1 bg-white"></td>
                  <td className="border border-blue-900 p-1">SPH.</td>
                  <td className="border border-blue-900 p-1">CYL.</td>
                  <td className="border border-blue-900 p-1">AXIS</td>
                  <td className="border border-blue-900 p-1">SPH.</td>
                  <td className="border border-blue-900 p-1">CYL.</td>
                  <td className="border border-blue-900 p-1">AXIS</td>
                </tr>
              </thead>
              <tbody className="font-semibold">
                <tr className="h-10">
                  <td className="border border-blue-900 p-1 font-bold text-blue-900">DIS.</td>
                  <td className="border border-blue-900 p-1">{rightSph}</td>
                  <td className="border border-blue-900 p-1">{rightCyl}</td>
                  <td className="border border-blue-900 p-1">{rightAxis}</td>
                  <td className="border border-blue-900 p-1">{leftSph}</td>
                  <td className="border border-blue-900 p-1">{leftCyl}</td>
                  <td className="border border-blue-900 p-1">{leftAxis}</td>
                </tr>
                <tr className="h-10">
                  <td className="border border-blue-900 p-1 font-bold text-blue-900">ADD</td>
                  <td className="border border-blue-900 p-1">{addPower}</td>
                  <td className="border border-blue-900 p-1 bg-gray-50/30"></td>
                  <td className="border border-blue-900 p-1 bg-gray-50/30"></td>
                  <td className="border border-blue-900 p-1">{addPower}</td>
                  <td className="border border-blue-900 p-1 bg-gray-50/30"></td>
                  <td className="border border-blue-900 p-1 bg-gray-50/30"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="w-full text-center pb-8">
            <p className="font-bold text-lg text-blue-900 font-sans">यह Slip सिर्फ Camp के लिए है।</p>
          </div>

        </div>
      )}

    </div>
  );
}
