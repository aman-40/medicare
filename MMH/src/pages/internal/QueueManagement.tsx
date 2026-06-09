import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { PlayCircle, CheckCircle, Printer, Trash2, Eye } from "lucide-react";
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

      {/* 2. Bill of Payment Template (Triggers on "Call") */}
      {printMedicalTemplateData && !printTokenData && (
        <div className="hidden print:flex flex-col fixed inset-0 w-full h-full bg-white text-black text-sm font-sans z-[9999]">
          
          {/* HEADER (Matching Eye Examination slip) */}
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

          <h2 className="text-center font-bold text-xl uppercase tracking-widest my-4 underline underline-offset-4">Bill / Receipt</h2>

          {/* PATIENT DETAILS */}
          <div className="px-6 py-2">
            <div className="flex justify-between items-end mb-4 text-[15px]">
              <div className="flex-1 flex items-end">
                <span className="font-semibold mr-2">Patient Name:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 uppercase">{printMedicalTemplateData.patient?.name}</span>
              </div>
              <div className="w-48 flex items-end ml-4">
                <span className="font-semibold mr-2">Age/Sex:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center uppercase">{printMedicalTemplateData.patient?.age || '    '} / {printMedicalTemplateData.patient?.gender?.charAt(0) || '    '}</span>
              </div>
            </div>
            <div className="flex justify-between items-end text-[15px]">
              <div className="flex-1 flex items-end">
                <span className="font-semibold mr-2">Address:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2">{printMedicalTemplateData.patient?.address}</span>
              </div>
              <div className="w-64 flex items-end ml-4">
                <span className="font-semibold mr-2">Date:</span>
                <span className="flex-1 border-b-[1.5px] border-dotted border-gray-500 pb-1 px-2 text-center">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* BILL PARTICULARS TABLE */}
          <div className="px-6 mt-8 flex-1">
            <table className="w-full border-collapse border-2 border-black text-left">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="border-r-2 border-black p-3 w-16 text-center">S.No.</th>
                  <th className="border-r-2 border-black p-3">Particulars</th>
                  <th className="p-3 w-40 text-center">Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r-2 border-black p-3 text-center h-12">1</td>
                  <td className="border-r-2 border-black p-3 font-semibold">Consultation Fee</td>
                  <td className="p-3 text-center">{printMedicalTemplateData.patient?.feeAmount ? `Rs. ${printMedicalTemplateData.patient.feeAmount}` : ''}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r-2 border-black p-3 text-center h-12">2</td>
                  <td className="border-r-2 border-black p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r-2 border-black p-3 text-center h-12">3</td>
                  <td className="border-r-2 border-black p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr>
                  <td className="border-r-2 border-black p-3 text-center h-12"></td>
                  <td className="border-r-2 border-black p-3 text-right font-bold">Total Amount</td>
                  <td className="p-3 text-center font-bold border-t-2 border-black">{printMedicalTemplateData.patient?.feeAmount ? `Rs. ${printMedicalTemplateData.patient.feeAmount}` : ''}</td>
                </tr>
              </tbody>
            </table>

            {/* PAYMENT MODE & SIGNATURE */}
            <div className="flex justify-between items-end mt-16 px-4">
              <div className="flex items-center space-x-6 text-lg font-bold">
                <span>Payment Mode:</span>
                <label className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-black">
                    {printMedicalTemplateData.patient?.paymentMethod === 'Cash' ? '✓' : ''}
                  </div>
                  <span>Cash</span>
                </label>
                <label className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black flex items-center justify-center font-black">
                    {printMedicalTemplateData.patient?.paymentMethod === 'Online' ? '✓' : ''}
                  </div>
                  <span>Online (UPI)</span>
                </label>
              </div>
              <div className="text-center">
                <div className="w-48 border-b-[1.5px] border-dotted border-gray-500 mb-2"></div>
                <span className="font-semibold">Authorized Signatory</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="w-full text-center pb-8 pt-2 mt-4">
            <p className="font-bold text-lg text-blue-900 font-sans">Thank you for visiting Priyanshi Eye Care Centre!</p>
          </div>

        </div>
      )}
    </div>
  );
}
