import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { History, Printer } from "lucide-react";
import api from "../../api/axios";

export default function PatientRecords() {
  const [patients, setPatients] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // For Printing
  const [printReportData, setPrintReportData] = useState<any>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  };

  const fetchHistory = async (patient: any) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const res = await api.get(`/clinic/patient/${patient.id}`);
      setSelectedPatientHistory(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePrintRecord = (report: any) => {
    setPrintReportData(report);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800">Patient Records</h1>
      </div>

      <Card className="border-2 border-slate-200 print:hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-xl">
          <CardTitle className="text-xl">All Registered Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No patients found</TableCell></TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium text-slate-900">{patient.patientCode}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.age} / {patient.gender}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => fetchHistory(patient)} className="text-blue-600 border-blue-200 hover:bg-blue-50" title="View Medical History">
                        <History className="w-4 h-4 mr-2" /> View History
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="print:hidden">
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center">
                <History className="w-6 h-6 mr-2 text-blue-600" /> 
                Patient Medical History: {selectedPatient?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {historyLoading ? (
                <p className="text-center py-8 text-slate-500">Loading history...</p>
              ) : selectedPatientHistory?.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No medical reports found for this patient.</p>
              ) : (
                selectedPatientHistory?.map((report: any) => (
                  <Card key={report.id} className="p-4 bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                      <div>
                        <span className="font-bold text-lg text-slate-800">{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}</span>
                        {report.reportData?.diagnosis && <Badge className="ml-3 bg-blue-100 text-blue-800">{report.reportData.diagnosis}</Badge>}
                      </div>
                      <Button variant="outline" size="sm" className="bg-white border-slate-300" onClick={() => handlePrintRecord(report)}>
                        <Printer className="w-4 h-4 mr-2" /> Print Record
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div className="bg-white p-3 rounded border">
                        <span className="font-bold text-blue-800 border-b pb-1 mb-2 block">Right Eye (OD)</span>
                        <div><span className="font-semibold text-slate-500">SPH:</span> {report.rightSph || '-'}</div>
                        <div><span className="font-semibold text-slate-500">CYL:</span> {report.rightCyl || '-'}</div>
                        <div><span className="font-semibold text-slate-500">AXIS:</span> {report.rightAxis || '-'}</div>
                        {report.reportData?.refractiveError?.od && (
                          <div className="mt-2"><span className="font-semibold text-slate-500">Refractive:</span> {report.reportData.refractiveError.od}</div>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <span className="font-bold text-emerald-800 border-b pb-1 mb-2 block">Left Eye (OS)</span>
                        <div><span className="font-semibold text-slate-500">SPH:</span> {report.leftSph || '-'}</div>
                        <div><span className="font-semibold text-slate-500">CYL:</span> {report.leftCyl || '-'}</div>
                        <div><span className="font-semibold text-slate-500">AXIS:</span> {report.leftAxis || '-'}</div>
                        {report.reportData?.refractiveError?.os && (
                          <div className="mt-2"><span className="font-semibold text-slate-500">Refractive:</span> {report.reportData.refractiveError.os}</div>
                        )}
                      </div>
                      
                      {(report.notes || report.reportData?.etiology) && (
                        <div className="col-span-2 bg-white p-3 rounded border">
                          {report.reportData?.etiology && <div><span className="font-semibold text-slate-500">Etiology:</span> {report.reportData.etiology}</div>}
                          {report.notes && <div><span className="font-semibold text-slate-500">Notes:</span> {report.notes}</div>}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- HIDDEN PRE-FILLED PRINT TEMPLATE --- */}
      {printReportData && selectedPatient && (
        <div className="hidden print:block absolute top-0 left-0 w-[210mm] h-[297mm] bg-white text-black p-4 text-xs font-sans">
          <div className="text-center mb-6 border-b-2 border-black pb-2">
            <h1 className="text-xl font-bold uppercase mb-1">VisionCare Eye Medical Report</h1>
            <p className="text-sm">Exceptional Student / Patient Evaluation Form</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div className="col-span-2 border-b border-black pb-1">
              <span className="font-semibold">Student/Patient Name:</span> <span className="text-lg">{selectedPatient.name}</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">DOB:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Date:</span> {new Date(printReportData.createdAt).toLocaleDateString()}
            </div>
            
            <div className="col-span-2 border-b border-black pb-1">
              <span className="font-semibold">Parent/Guardian Name:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Email:</span>
            </div>
            <div className="border-b border-black pb-1">
              <span className="font-semibold">Phone:</span> {selectedPatient.phone}
            </div>

            <div className="col-span-4 border-b border-black pb-1">
              <span className="font-semibold">Address:</span> {selectedPatient.address}
            </div>
          </div>

          <div className="font-bold text-sm bg-gray-100 p-2 mb-4 border border-black">
            Attention: Eye Care Specialist (A licensed ophthalmologist or optometrist must address each item below).
          </div>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Diagnosis:</span>
              <span className="flex-1">{printReportData.reportData?.diagnosis || ''}</span>
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Etiology:</span>
              <span className="flex-1">{printReportData.reportData?.etiology || ''}</span>
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
                  <td className="border-r border-black">{printReportData.reportData?.visualAcuity?.distance?.[row.key]?.uncorrected || ''}</td>
                  <td className="border-r border-black">{printReportData.reportData?.visualAcuity?.distance?.[row.key]?.corrected || ''}</td>
                  <td className="border-r border-black">{printReportData.reportData?.visualAcuity?.near?.[row.key]?.uncorrected || ''}</td>
                  <td>{printReportData.reportData?.visualAcuity?.near?.[row.key]?.corrected || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Refractive Error:</span> OD (Right) &nbsp;{printReportData.reportData?.refractiveError?.od || ''}
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) &nbsp;{printReportData.reportData?.refractiveError?.os || ''}
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Ocular Pressure:</span> OD (Right) &nbsp;{printReportData.reportData?.ocularPressure?.od || ''}
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) &nbsp;{printReportData.reportData?.ocularPressure?.os || ''}
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Does this student have difficulties seeing color?</span>
              [{printReportData.reportData?.colorDifficulty ? 'X' : ' '}] Yes &nbsp;&nbsp; [{printReportData.reportData?.colorDifficulty === false ? 'X' : ' '}] No
              <div className="mt-2 border-b border-black h-6">If yes, describe: {printReportData.reportData?.colorDescription || ''}</div>
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Is the student photophobic?</span>
              [{printReportData.reportData?.photophobic ? 'X' : ' '}] Yes &nbsp;&nbsp; [{printReportData.reportData?.photophobic === false ? 'X' : ' '}] No
            </div>
            <div className="col-span-2 flex items-end">
              <span className="font-semibold mr-2">Lighting conditions:</span>
              <div className="border-b border-black flex-1 h-6">{printReportData.reportData?.lightingConditions || ''}</div>
            </div>
          </div>

          <div className="mb-6 border border-black p-4 text-sm">
            <p className="font-bold mb-2">Complete ONLY if Acuity cannot be measured. Check the most appropriate estimation below:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>[{printReportData.reportData?.acuityEstimation === 'Better than 20/70' ? 'X' : ' '}] Better than 20/70</div>
              <div>[{printReportData.reportData?.acuityEstimation === 'Legally blind 20/200 or worse' ? 'X' : ' '}] Legally blind 20/200 or worse</div>
              <div>[{printReportData.reportData?.acuityEstimation === 'Between 20/70 and 20/200' ? 'X' : ' '}] Between 20/70 and 20/200</div>
              <div>[{printReportData.reportData?.acuityEstimation === 'Functions at definition of blindness' ? 'X' : ' '}] Functions at the definition of blindness</div>
            </div>
            
            <p className="font-bold mt-4 mb-2">For Students Who Are Otherwise Unable to be Assessed:</p>
            <p className="mb-1">Describe the function if standard visual acuities and measures of field of vision are unattainable:</p>
            <div className="border-b border-black h-6 mb-2">{printReportData.reportData?.unableToAssessDesc || ''}</div>
          </div>

          <h2 className="font-bold text-lg mb-2 border-b border-black">Visual Fields</h2>
          <div className="text-sm space-y-4">
            <div>
              <span className="font-semibold mr-4">Does the student have a field loss?</span>
              [{printReportData.reportData?.fieldLoss ? 'X' : ' '}] Yes &nbsp;&nbsp; [{printReportData.reportData?.fieldLoss === false ? 'X' : ' '}] No
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex items-end">
                <span className="mr-2">Describe: &nbsp; Central:</span>
                <div className="border-b border-black flex-1 h-6">{printReportData.reportData?.fieldCentral || ''}</div>
              </div>
              <div className="flex items-end">
                <span className="mr-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Peripheral:</span>
                <div className="border-b border-black flex-1 h-6">{printReportData.reportData?.fieldPeripheral || ''}</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
