import { FileText, ImageIcon, CloudDownload } from "lucide-react";
const HistoryRecordsView = ({ isLoadingHistory, historyRecords }: { isLoadingHistory: boolean, historyRecords: Array<any> }) => (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 h-full">
        <div className="p-4 border-b border-slate-50 lg:hidden shrink-0 bg-white rounded-t-xl shadow-sm border-x border-t border-slate-100 -mx-4 -mt-4 mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Scans</h4>
        </div>
        {isLoadingHistory ? (
            <div className="text-sm text-slate-500 animate-pulse text-center py-8">Loading history...</div>
        ) : historyRecords.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">No records found.</div>
        ) : (
            historyRecords.map(record => (
                <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.format === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {record.format === 'PDF' ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 truncate w-40 lg:w-48">{record.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{record.date} • {record.size}</p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-[#007DBA] transition-colors p-2"><CloudDownload size={18} /></button>
                </div>
            ))
        )}
    </div>
);

export default HistoryRecordsView;