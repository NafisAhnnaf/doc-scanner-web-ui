
import { Printer } from "lucide-react";
const ScannerInfoView = () => (
    <div className="p-4 lg:p-6 h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full lg:h-auto">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-sky-50 text-[#007DBA] rounded-xl flex items-center justify-center">
                    <Printer size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">HP DeskJet 2600</h3>
                    <p className="text-xs text-green-500 font-medium mt-1">Ready / Online</p>
                </div>
            </div>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-3">
                    <span className="text-slate-500">IP Address</span>
                    <span className="font-medium text-slate-700">192.168.1.104</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                    <span className="text-slate-500">Firmware</span>
                    <span className="font-medium text-slate-700">v2.4.1</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                    <span className="text-slate-500">Mac Address</span>
                    <span className="font-medium text-slate-700">00:1B:44:11:3A:B7</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Paper Level</span>
                    <span className="font-medium text-slate-700">Adequate</span>
                </div>
            </div>
        </div>
    </div>
);

export default ScannerInfoView;