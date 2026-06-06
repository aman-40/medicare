import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { PlayCircle, CheckCircle, Printer, Trash2 } from "lucide-react";
import api from "../../api/axios";

export default function QueueManagement() {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentToken, setCurrentToken] = useState<number | null>(null);

  const [printTokenData, setPrintTokenData] = useState<any>(null);
  const [printMedicalTemplateData, setPrintMedicalTemplateData] = useState<any>(null);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue');
      setQueue(res.data.queueItems);
      setCurrentToken(res.data.currentToken);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/queue/${id}/status`, { status });
      fetchQueue();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteQueueItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this patient from the queue?")) return;
    try {
      await api.delete(`/queue/${id}`);
      fetchQueue();
    } catch (error) {
      console.error("Failed to delete queue item", error);
    }
  };

  const handlePrintToken = (item: any) => {
    setPrintMedicalTemplateData(null);
    setPrintTokenData(item);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCallAndPrintTemplate = async (item: any) => {
    // Update status to Serving
    await updateStatus(item.id, 'Serving');
    
    // Set Medical Template data and Print
    setPrintTokenData(null);
    setPrintMedicalTemplateData(item);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800">Live Queue</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <Card className="col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-8 h-full">
            <h2 className="text-2xl font-semibold opacity-90 mb-2">Current Token</h2>
            <div className="text-8xl font-black tabular-nums tracking-tighter">
              {currentToken ? currentToken : "--"}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle>Waiting List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Queue is empty</TableCell></TableRow>
                ) : (
                  queue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-lg">{item.tokenNumber}</TableCell>
                      <TableCell className="font-medium">{item.patient?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'Serving' ? 'default' : 'secondary'} className={item.status === 'Serving' ? 'bg-blue-600' : ''}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {item.status === 'Waiting' && (
                          <Button size="sm" onClick={() => handleCallAndPrintTemplate(item)} className="bg-emerald-600 hover:bg-emerald-700" title="Call and Print Medical Report">
                            <PlayCircle className="w-4 h-4 mr-1" /> Call
                          </Button>
                        )}
                        {item.status === 'Serving' && (
                          <Button size="sm" onClick={() => updateStatus(item.id, 'Completed')} className="bg-slate-800 hover:bg-slate-900">
                            <CheckCircle className="w-4 h-4 mr-1" /> Done
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handlePrintToken(item)} title="Print Queue Token">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteQueueItem(item.id)} title="Remove from Queue">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* --- HIDDEN PRINT TEMPLATES --- */}
      
      {/* 1. Standard Token Print */}
      {printTokenData && !printMedicalTemplateData && (
        <div className="hidden print:block absolute top-0 left-0 w-[210mm] bg-white p-[20mm]">
          <div className="w-full border-4 border-slate-800 p-8 flex flex-col relative">
            <div className="text-center border-b-2 border-slate-300 pb-6 mb-8">
              <h1 className="text-4xl font-black uppercase tracking-wider mb-2">VisionCare Clinic</h1>
              <p className="text-xl text-slate-600">Patient Registration Token</p>
            </div>
            
            <div className="flex justify-center mb-12">
              <div className="border-4 border-slate-800 rounded-2xl p-8 text-center bg-slate-50 min-w-[300px]">
                <p className="text-xl font-bold uppercase text-slate-500 tracking-widest mb-2">Token Number</p>
                <p className="text-8xl font-black">{printTokenData.tokenNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-lg">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase">Patient ID</p>
                <p className="font-semibold text-2xl border-b border-slate-200 pb-1">{printTokenData.patient?.patientCode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-bold text-slate-500 uppercase">Full Name</p>
                <p className="font-semibold text-3xl border-b border-slate-200 pb-1">{printTokenData.patient?.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Advanced Eye Medical Report Template */}
      {printMedicalTemplateData && !printTokenData && (
        <div className="hidden print:block absolute top-0 left-0 w-[210mm] h-[297mm] bg-white text-black p-4 text-xs font-sans">
          <div className="text-center mb-6 border-b-2 border-black pb-2">
            <h1 className="text-xl font-bold uppercase mb-1">VisionCare Eye Medical Report</h1>
            <p className="text-sm">Exceptional Student / Patient Evaluation Form</p>
          </div>

          {/* Header Info */}
          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div className="col-span-2 border-b border-black pb-1">
              <span className="font-semibold">Student/Patient Name:</span> <span className="text-lg">{printMedicalTemplateData.patient?.name}</span>
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
              <span className="font-semibold">Phone:</span> {printMedicalTemplateData.patient?.phone}
            </div>

            <div className="col-span-4 border-b border-black pb-1">
              <span className="font-semibold">Address:</span> {printMedicalTemplateData.patient?.address}
            </div>
          </div>

          <div className="font-bold text-sm bg-gray-100 p-2 mb-4 border border-black">
            Attention: Eye Care Specialist (A licensed ophthalmologist or optometrist must address each item below).
          </div>

          {/* Diagnosis & Etiology */}
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Diagnosis:</span>
              <span className="flex-1"></span>
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-24 font-bold">Etiology:</span>
              <span className="flex-1"></span>
            </div>
          </div>

          {/* Visual Acuity */}
          <h2 className="font-bold text-lg mb-2 border-b border-black">Visual Acuity</h2>
          <table className="w-full mb-6 border border-black">
            <thead>
              <tr className="bg-gray-50 border-b border-black text-center">
                <th className="border-r border-black p-2"></th>
                <th className="border-r border-black p-2" colSpan={2}>Distance Vision</th>
                <th className="p-2" colSpan={2}>Near Vision</th>
              </tr>
              <tr className="border-b border-black text-center text-[10px]">
                <th className="border-r border-black p-1"></th>
                <th className="border-r border-black p-1">Without Correction</th>
                <th className="border-r border-black p-1">With Best Correction</th>
                <th className="border-r border-black p-1">Without Correction</th>
                <th className="p-1">With Best Correction</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black h-10">
                <td className="border-r border-black p-2 font-bold w-24">OD (Right)</td>
                <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
              </tr>
              <tr className="border-b border-black h-10">
                <td className="border-r border-black p-2 font-bold">OS (Left)</td>
                <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
              </tr>
              <tr className="h-10">
                <td className="border-r border-black p-2 font-bold">OU (Both)</td>
                <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
              </tr>
            </tbody>
          </table>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Refractive Error:</span> OD (Right) _________
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) _________
            </div>
            <div className="flex border-b border-black pb-1">
              <span className="w-32 font-semibold">Ocular Pressure:</span> OD (Right) _________
            </div>
            <div className="flex border-b border-black pb-1">
              OS (Left) _________
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Does this student have difficulties seeing color?</span>
              [ ] Yes &nbsp;&nbsp; [ ] No
              <div className="mt-2 border-b border-black h-6">If yes, describe:</div>
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-4">Is the student photophobic?</span>
              [ ] Yes &nbsp;&nbsp; [ ] No
            </div>
            <div className="col-span-2 flex items-end">
              <span className="font-semibold mr-2">Lighting conditions:</span>
              <div className="border-b border-black flex-1 h-6"></div>
            </div>
          </div>

          <div className="mb-6 border border-black p-4 text-sm">
            <p className="font-bold mb-2">Complete ONLY if Acuity cannot be measured. Check the most appropriate estimation below:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>[ ] Better than 20/70</div>
              <div>[ ] Legally blind 20/200 or worse</div>
              <div>[ ] Between 20/70 and 20/200</div>
              <div>[ ] Functions at the definition of blindness</div>
            </div>
            
            <p className="font-bold mt-4 mb-2">For Students Who Are Otherwise Unable to be Assessed:</p>
            <p className="mb-1">Describe the function if standard visual acuities and measures of field of vision are unattainable:</p>
            <div className="border-b border-black h-6 mb-2"></div>
            <div className="border-b border-black h-6"></div>
          </div>

          <h2 className="font-bold text-lg mb-2 border-b border-black">Visual Fields</h2>
          <div className="text-sm space-y-4">
            <div>
              <span className="font-semibold mr-4">Does the student have a field loss?</span>
              [ ] Yes &nbsp;&nbsp; [ ] No
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex items-end">
                <span className="mr-2">Describe: &nbsp; [ ] Central:</span>
                <div className="border-b border-black flex-1 h-6"></div>
              </div>
              <div className="flex items-end">
                <span className="mr-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ ] Peripheral:</span>
                <div className="border-b border-black flex-1 h-6"></div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
