import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { FileBarChart, Clock } from "lucide-react";
import api from "../../api/axios";

export default function Reports() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/inventory/audit-logs');
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'INSERT': return 'text-emerald-600 bg-emerald-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <FileBarChart className="w-8 h-8 mr-3 text-blue-600" />
            Audit & Transactions Ledger
          </h1>
          <p className="text-slate-500 mt-1">View the immutable transaction history for all database records.</p>
        </div>
      </div>

      <Card className="border-2 border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-4">
          <CardTitle className="text-lg text-slate-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
                <TableHead className="w-[150px]">Table</TableHead>
                <TableHead className="w-[120px]">Record ID</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading audit logs...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No logs found.</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm font-medium text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {log.tableName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {log.recordId}
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.actionType === 'UPDATE' && log.newData && log.oldData ? (
                        <div className="space-y-1">
                          {Object.keys(log.newData).map(key => {
                            const oldVal = (log.oldData as any)[key];
                            const newVal = (log.newData as any)[key];
                            if (oldVal !== newVal) {
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="font-semibold">{key}:</span>
                                  <span className="line-through text-red-500">{String(oldVal)}</span>
                                  <span className="text-emerald-600 font-bold">{String(newVal)}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <div className="text-slate-500 truncate max-w-md">
                          {JSON.stringify(log.actionType === 'DELETE' ? log.oldData : log.newData)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
