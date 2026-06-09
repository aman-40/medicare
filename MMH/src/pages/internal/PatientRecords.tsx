import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { History, Printer, Search, Eye } from "lucide-react";
import api from "../../api/axios";

export default function PatientRecords() {
  const [patients, setPatients] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
        <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-xl flex flex-row items-center justify-between">
          <CardTitle className="text-xl">All Registered Patients</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, phone or code..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              {patients.filter(p => {
                const q = searchTerm.toLowerCase();
                return p.name?.toLowerCase().includes(q) || 
                       p.phone?.toLowerCase().includes(q) || 
                       p.patientCode?.toLowerCase().includes(q);
              }).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No patients found</TableCell></TableRow>
              ) : (
                patients.filter(p => {
                  const q = searchTerm.toLowerCase();
                  return p.name?.toLowerCase().includes(q) || 
                         p.phone?.toLowerCase().includes(q) || 
                         p.patientCode?.toLowerCase().includes(q);
                }).map((patient) => (
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

          {/* PATIENT INFO */}
          <div className="px-6 py-2">
            <div className="flex justify-between items-end mb-4 text-[15px]">
              <div className="flex-1 flex items-end">
                <span className="font-semibold mr-2">Patient Name:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 uppercase">{selectedPatient.name}</span>
              </div>
              <div className="w-48 flex items-end ml-4">
                <span className="font-semibold mr-2">Age/Sex:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center uppercase">{selectedPatient.age || '    '} / {selectedPatient.gender?.charAt(0) || '    '}</span>
              </div>
            </div>
            <div className="flex justify-between items-end mb-6 text-[15px]">
              <div className="w-64 flex items-end">
                <span className="font-semibold mr-2">Date:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center">{new Date(printReportData.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex-1 flex items-end ml-4">
                <span className="font-semibold mr-2">Address:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2">{selectedPatient.address}</span>
              </div>
            </div>
          </div>

          {/* CLINICAL OBSERVATIONS BODY */}
          <div className="flex px-4 mt-2">
            {/* LEFT COLUMN: V/A, Pupil, Cornea */}
            <div className="w-1/2 flex flex-col space-y-6">
              {/* V A */}
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">V A</span>
                <span className="text-4xl font-light text-gray-400">&lt;</span>
                <div className="flex flex-col ml-4 space-y-3 font-semibold text-base w-48">
                  <div className="border-b border-black pb-1 uppercase">{printReportData.reportData?.va || ''}</div>
                  <div className="border-b border-black pb-1 uppercase"></div>
                </div>
              </div>

              {/* Pupil */}
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">Pupil</span>
                <span className="text-4xl font-light text-gray-400">&lt;</span>
                <div className="flex flex-col ml-4 space-y-3 font-semibold text-base w-48">
                  <div className="border-b border-black pb-1 uppercase">{printReportData.reportData?.pupil || ''}</div>
                  <div className="border-b border-black pb-1 uppercase"></div>
                </div>
              </div>

              {/* Cornea */}
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">Cornea</span>
                <span className="text-4xl font-light text-gray-400">&lt;</span>
                <div className="flex flex-col ml-4 space-y-3 font-semibold text-base w-48">
                  <div className="border-b border-black pb-1 uppercase">{printReportData.reportData?.cornea || ''}</div>
                  <div className="border-b border-black pb-1 uppercase"></div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: C/o */}
            <div className="w-1/2 border-l border-black pl-4">
              <div className="flex">
                <span className="font-bold text-lg mr-2 whitespace-nowrap">C/o -</span>
                <div className="flex-1 flex flex-col space-y-6 mt-1">
                  <div className="border-b border-black pb-1 font-semibold uppercase">{printReportData.reportData?.chiefComplaint || ''}</div>
                  <div className="border-b border-black pb-1"></div>
                  <div className="border-b border-black pb-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* PRESCRIPTION TABLE */}
          <div className="w-full flex justify-center mb-8 px-6">
            <table className="w-[85%] border-collapse border-2 border-black text-center text-sm font-semibold">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="border-r-2 border-black p-2 w-24">N.V./<br/>CONSTANT<br/>VALUE</th>
                  <th className="border-r border-black p-2 w-20">S.P.H</th>
                  <th className="border-r border-black p-2 w-20">C.Y.L</th>
                  <th className="border-r-2 border-black p-2 w-20">AXIS</th>
                  <th className="border-r border-black p-2 w-20">S.P.H</th>
                  <th className="border-r border-black p-2 w-20">C.Y.L</th>
                  <th className="p-2 w-20">AXIS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black h-12">
                  <td className="border-r-2 border-black p-2 font-bold text-left pl-4">DIS.</td>
                  <td className="border-r border-black">{printReportData.rightSph}</td>
                  <td className="border-r border-black">{printReportData.rightCyl}</td>
                  <td className="border-r-2 border-black">{printReportData.rightAxis}</td>
                  <td className="border-r border-black">{printReportData.leftSph}</td>
                  <td className="border-r border-black">{printReportData.leftCyl}</td>
                  <td>{printReportData.leftAxis}</td>
                </tr>
                <tr className="h-12">
                  <td className="border-r-2 border-black p-2 font-bold text-left pl-4">ADD</td>
                  <td colSpan={3} className="border-r-2 border-black">{printReportData.addPower}</td>
                  <td colSpan={3}>{printReportData.addPower}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="w-full text-center pb-4 pt-2">
            <p className="font-bold text-xl text-blue-900 mb-1" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>यह Slip सिर्फ Camp के लिए है।</p>
          </div>

        </div>
      )}

    </div>
  );
}
