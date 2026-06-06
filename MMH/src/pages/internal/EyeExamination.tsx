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

  // Extended JSON Fields (Medical Report)
  const [reportData, setReportData] = useState({
    diagnosis: '',
    etiology: '',
    visualAcuity: {
      distance: { od: { uncorrected: '', corrected: '' }, os: { uncorrected: '', corrected: '' }, ou: { uncorrected: '', corrected: '' } },
      near: { od: { uncorrected: '', corrected: '' }, os: { uncorrected: '', corrected: '' }, ou: { uncorrected: '', corrected: '' } }
    },
    refractiveError: { od: '', os: '' },
    ocularPressure: { od: '', os: '' },
    colorDifficulty: false,
    colorDescription: '',
    photophobic: false,
    lightingConditions: '',
    acuityEstimation: '', // 'Better than 20/70', 'Legally blind', 'Between 20/70 and 20/200', 'Functions at definition'
    unableToAssessDesc: '',
    fieldLoss: false,
    fieldCentral: '',
    fieldPeripheral: ''
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
        diagnosis: '', etiology: '',
        visualAcuity: {
          distance: { od: { uncorrected: '', corrected: '' }, os: { uncorrected: '', corrected: '' }, ou: { uncorrected: '', corrected: '' } },
          near: { od: { uncorrected: '', corrected: '' }, os: { uncorrected: '', corrected: '' }, ou: { uncorrected: '', corrected: '' } }
        },
        refractiveError: { od: '', os: '' },
        ocularPressure: { od: '', os: '' },
        colorDifficulty: false, colorDescription: '',
        photophobic: false, lightingConditions: '',
        acuityEstimation: '', unableToAssessDesc: '',
        fieldLoss: false, fieldCentral: '', fieldPeripheral: ''
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

            {/* Diagnosis & Etiology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Input value={reportData.diagnosis} onChange={e => handleReportDataChange(['diagnosis'], e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Etiology</Label>
                <Input value={reportData.etiology} onChange={e => handleReportDataChange(['etiology'], e.target.value)} />
              </div>
            </div>

            {/* Visual Acuity */}
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-lg font-bold mb-4 block">Visual Acuity</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border border-slate-300 p-2"></th>
                      <th colSpan={2} className="border border-slate-300 p-2 text-center">Distance Vision</th>
                      <th colSpan={2} className="border border-slate-300 p-2 text-center">Near Vision</th>
                    </tr>
                    <tr className="text-xs">
                      <th className="border border-slate-300 p-2"></th>
                      <th className="border border-slate-300 p-2 text-center">Without Correction</th>
                      <th className="border border-slate-300 p-2 text-center">With Best Correction</th>
                      <th className="border border-slate-300 p-2 text-center">Without Correction</th>
                      <th className="border border-slate-300 p-2 text-center">With Best Correction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'od', label: 'OD (Right)' },
                      { key: 'os', label: 'OS (Left)' },
                      { key: 'ou', label: 'OU (Both)' }
                    ].map(row => (
                      <tr key={row.key}>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">{row.label}</td>
                        <td className="border border-slate-300 p-1"><Input value={reportData.visualAcuity.distance[row.key as keyof typeof reportData.visualAcuity.distance].uncorrected} onChange={e => handleReportDataChange(['visualAcuity', 'distance', row.key, 'uncorrected'], e.target.value)} className="h-8 rounded-none border-none shadow-none focus-visible:ring-0" /></td>
                        <td className="border border-slate-300 p-1"><Input value={reportData.visualAcuity.distance[row.key as keyof typeof reportData.visualAcuity.distance].corrected} onChange={e => handleReportDataChange(['visualAcuity', 'distance', row.key, 'corrected'], e.target.value)} className="h-8 rounded-none border-none shadow-none focus-visible:ring-0" /></td>
                        <td className="border border-slate-300 p-1"><Input value={reportData.visualAcuity.near[row.key as keyof typeof reportData.visualAcuity.near].uncorrected} onChange={e => handleReportDataChange(['visualAcuity', 'near', row.key, 'uncorrected'], e.target.value)} className="h-8 rounded-none border-none shadow-none focus-visible:ring-0" /></td>
                        <td className="border border-slate-300 p-1"><Input value={reportData.visualAcuity.near[row.key as keyof typeof reportData.visualAcuity.near].corrected} onChange={e => handleReportDataChange(['visualAcuity', 'near', row.key, 'corrected'], e.target.value)} className="h-8 rounded-none border-none shadow-none focus-visible:ring-0" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2"><Label>Refractive Error</Label><Input value={reportData.refractiveError.od} onChange={e => handleReportDataChange(['refractiveError', 'od'], e.target.value)} /></div>
                  <div className="space-y-2"><Label>Ocular Pressure</Label><Input value={reportData.ocularPressure.od} onChange={e => handleReportDataChange(['ocularPressure', 'od'], e.target.value)} /></div>
                </div>
              </div>

              <div className="space-y-4 border rounded-xl p-6 bg-emerald-50/50">
                <h3 className="font-bold text-lg border-b pb-2 text-emerald-800">Left Eye (OS)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>SPH</Label><Input value={leftSph} onChange={e => setLeftSph(e.target.value)} placeholder="+0.00" /></div>
                  <div className="space-y-2"><Label>CYL</Label><Input value={leftCyl} onChange={e => setLeftCyl(e.target.value)} placeholder="-0.00" /></div>
                  <div className="space-y-2"><Label>AXIS</Label><Input value={leftAxis} onChange={e => setLeftAxis(e.target.value)} placeholder="180" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2"><Label>Refractive Error</Label><Input value={reportData.refractiveError.os} onChange={e => handleReportDataChange(['refractiveError', 'os'], e.target.value)} /></div>
                  <div className="space-y-2"><Label>Ocular Pressure</Label><Input value={reportData.ocularPressure.os} onChange={e => handleReportDataChange(['ocularPressure', 'os'], e.target.value)} /></div>
                </div>
              </div>
            </div>

            {/* Conditions & Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="colorDiff" checked={reportData.colorDifficulty} onCheckedChange={(c) => handleReportDataChange(['colorDifficulty'], !!c)} />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="colorDiff" className="font-semibold">Difficulties seeing color?</Label>
                  </div>
                </div>
                {reportData.colorDifficulty && (
                  <Input placeholder="Describe color difficulties..." value={reportData.colorDescription} onChange={e => handleReportDataChange(['colorDescription'], e.target.value)} />
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox id="photo" checked={reportData.photophobic} onCheckedChange={(c) => handleReportDataChange(['photophobic'], !!c)} />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="photo" className="font-semibold">Is the patient photophobic?</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Lighting Conditions</Label>
                  <Input value={reportData.lightingConditions} onChange={e => handleReportDataChange(['lightingConditions'], e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="field" checked={reportData.fieldLoss} onCheckedChange={(c) => handleReportDataChange(['fieldLoss'], !!c)} />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="field" className="font-semibold text-lg">Visual Field Loss?</Label>
                  </div>
                </div>
                {reportData.fieldLoss && (
                  <div className="space-y-4 pl-6 border-l-2 border-slate-200">
                    <div className="space-y-2">
                      <Label>Central Loss Description</Label>
                      <Input value={reportData.fieldCentral} onChange={e => handleReportDataChange(['fieldCentral'], e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Peripheral Loss Description</Label>
                      <Input value={reportData.fieldPeripheral} onChange={e => handleReportDataChange(['fieldPeripheral'], e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Unmeasurable Acuity */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <Label className="font-semibold text-red-600 block">Complete ONLY if Acuity cannot be measured:</Label>
              <Select value={reportData.acuityEstimation} onValueChange={v => handleReportDataChange(['acuityEstimation'], v)}>
                <SelectTrigger className="max-w-md"><SelectValue placeholder="Check appropriate estimation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Better than 20/70">Better than 20/70</SelectItem>
                  <SelectItem value="Between 20/70 and 20/200">Between 20/70 and 20/200</SelectItem>
                  <SelectItem value="Legally blind 20/200 or worse">Legally blind 20/200 or worse</SelectItem>
                  <SelectItem value="Functions at definition of blindness">Functions at definition of blindness</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <Label>For patients otherwise unable to be assessed (Describe function):</Label>
                <Textarea value={reportData.unableToAssessDesc} onChange={e => handleReportDataChange(['unableToAssessDesc'], e.target.value)} rows={2} />
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
        <div className="hidden print:block absolute top-0 left-0 w-[210mm] h-[297mm] bg-white text-black p-4 text-xs font-sans">
          <div className="text-center mb-6 border-b-2 border-black pb-2">
            <h1 className="text-xl font-bold uppercase mb-1">VisionCare Eye Medical Report</h1>
            <p className="text-sm">Exceptional Student / Patient Evaluation Form</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div className="col-span-2 border-b border-black pb-1">
              <span className="font-semibold">Student/Patient Name:</span> <span className="text-lg">{selectedPatient?.name}</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">DOB:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
            </div>
            
            <div className="col-span-2 border-b border-black pb-1">
              <span className="font-semibold">Parent/Guardian Name:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Email:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Phone:</span> {selectedPatient?.phone}
            </div>

            <div className="col-span-4 border-b border-black pb-1">
              <span className="font-semibold">Address:</span> {selectedPatient?.address}
            </div>
          </div>

          <div className="font-bold text-sm bg-gray-100 p-2 mb-4 border border-black">
            Attention: Eye Care Specialist (A licensed ophthalmologist or optometrist must address each item below).
          </div>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Diagnosis:</span>
              <span className="flex-1">{reportData.diagnosis}</span>
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Etiology:</span>
              <span className="flex-1">{reportData.etiology}</span>
            </div>
          </div>

          <h2 className="font-bold text-lg mb-2 border-b border-black">Visual Acuity</h2>
          <table className="w-full mb-6 border border-black text-center">
            <thead>
              <tr className="bg-gray-50 border-b border-black">
                <th className="border-r border-black p-2"></th>
                <th className="border-r border-black p-2" colSpan={2}>Distance Vision</th>
                <th className="p-2" colSpan={2}>Near Vision</th>
              </tr>
              <tr className="border-b border-black text-[10px]">
                <th className="border-r border-black p-1"></th>
                <th className="border-r border-black p-1">Without Correction</th>
                <th className="border-r border-black p-1">With Best Correction</th>
                <th className="border-r border-black p-1">Without Correction</th>
                <th className="p-1">With Best Correction</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'od', label: 'OD (Right)' },
                { key: 'os', label: 'OS (Left)' },
                { key: 'ou', label: 'OU (Both)' }
              ].map(row => (
                <tr key={row.key} className="border-b border-black h-8">
                  <td className="border-r border-black p-2 font-bold w-24 text-left">{row.label}</td>
                  <td className="border-r border-black">{reportData.visualAcuity.distance[row.key as keyof typeof reportData.visualAcuity.distance].uncorrected}</td>
                  <td className="border-r border-black">{reportData.visualAcuity.distance[row.key as keyof typeof reportData.visualAcuity.distance].corrected}</td>
                  <td className="border-r border-black">{reportData.visualAcuity.near[row.key as keyof typeof reportData.visualAcuity.near].uncorrected}</td>
                  <td>{reportData.visualAcuity.near[row.key as keyof typeof reportData.visualAcuity.near].corrected}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Refractive Error:</span> OD (Right) &nbsp;{reportData.refractiveError.od}
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) &nbsp;{reportData.refractiveError.os}
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Ocular Pressure:</span> OD (Right) &nbsp;{reportData.ocularPressure.od}
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) &nbsp;{reportData.ocularPressure.os}
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Does this student have difficulties seeing color?</span>
              [{reportData.colorDifficulty ? 'X' : ' '}] Yes &nbsp;&nbsp; [{!reportData.colorDifficulty ? 'X' : ' '}] No
              <div className="mt-2 border-b border-black h-6">If yes, describe: {reportData.colorDescription}</div>
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Is the student photophobic?</span>
              [{reportData.photophobic ? 'X' : ' '}] Yes &nbsp;&nbsp; [{!reportData.photophobic ? 'X' : ' '}] No
            </div>
            <div className="col-span-2 flex items-end">
              <span className="font-semibold mr-2">Lighting conditions:</span>
              <div className="border-b border-black flex-1 h-6">{reportData.lightingConditions}</div>
            </div>
          </div>

          <div className="mb-6 border border-black p-4 text-sm">
            <p className="font-bold mb-2">Complete ONLY if Acuity cannot be measured. Check the most appropriate estimation below:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>[{reportData.acuityEstimation === 'Better than 20/70' ? 'X' : ' '}] Better than 20/70</div>
              <div>[{reportData.acuityEstimation === 'Legally blind 20/200 or worse' ? 'X' : ' '}] Legally blind 20/200 or worse</div>
              <div>[{reportData.acuityEstimation === 'Between 20/70 and 20/200' ? 'X' : ' '}] Between 20/70 and 20/200</div>
              <div>[{reportData.acuityEstimation === 'Functions at definition of blindness' ? 'X' : ' '}] Functions at the definition of blindness</div>
            </div>
            
            <p className="font-bold mt-4 mb-2">For Students Who Are Otherwise Unable to be Assessed:</p>
            <p className="mb-1">Describe the function if standard visual acuities and measures of field of vision are unattainable:</p>
            <div className="border-b border-black h-6 mb-2">{reportData.unableToAssessDesc}</div>
          </div>

          <h2 className="font-bold text-lg mb-2 border-b border-black">Visual Fields</h2>
          <div className="text-sm space-y-4">
            <div>
              <span className="font-semibold mr-4">Does the student have a field loss?</span>
              [{reportData.fieldLoss ? 'X' : ' '}] Yes &nbsp;&nbsp; [{!reportData.fieldLoss ? 'X' : ' '}] No
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex items-end">
                <span className="mr-2">Describe: &nbsp; Central:</span>
                <div className="border-b border-black flex-1 h-6">{reportData.fieldCentral}</div>
              </div>
              <div className="flex items-end">
                <span className="mr-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Peripheral:</span>
                <div className="border-b border-black flex-1 h-6">{reportData.fieldPeripheral}</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
