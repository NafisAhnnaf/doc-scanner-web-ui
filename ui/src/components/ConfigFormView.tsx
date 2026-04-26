import { Play } from "lucide-react";
import React from "react";


type FileFormat = 'PDF' | 'PNG';
type ColorMode = 'RGB Color' | 'Black & White' | 'Grayscale';
type Resolution = '72 DPI' | '150 DPI' | '300 DPI (Standard)' | '600 DPI (High)';


interface ScanConfig {
    format: FileFormat;
    colorMode: ColorMode;
    resolution: Resolution;
}
interface ConfigFormViewProps {
    handleScan: () => void;
    setConfig: React.Dispatch<React.SetStateAction<ScanConfig>>;
    config: ScanConfig;
    isScanning: boolean;
}
const ConfigFormView = ({ setConfig, config, handleScan, isScanning }: ConfigFormViewProps) => (
    <div className="p-4 lg:p-6 h-full flex flex-col bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
        <div className="p-4 border-b border-slate-50 lg:hidden shrink-0 -mx-4 -mt-4 mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan Configuration</h4>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">File Format</label>
                <div className="flex gap-2">
                    {(['PDF', 'PNG'] as FileFormat[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setConfig({ ...config, format: f })}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${config.format === f ? 'bg-white border-[#007DBA] text-[#007DBA] shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Color Mode</label>
                <select
                    value={config.colorMode}
                    onChange={(e) => setConfig({ ...config, colorMode: e.target.value as ColorMode })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#007DBA] transition-colors appearance-none"
                >
                    <option>RGB Color</option>
                    <option>Black & White</option>
                    <option>Grayscale</option>
                </select>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Resolution (DPI)</label>
                <select
                    value={config.resolution}
                    onChange={(e) => setConfig({ ...config, resolution: e.target.value as Resolution })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#007DBA] transition-colors appearance-none"
                >
                    <option>72 DPI</option>
                    <option>150 DPI</option>
                    <option>300 DPI (Standard)</option>
                    <option>600 DPI (High)</option>
                </select>
            </div>
        </div>

        <div className="hidden lg:block shrink-0 mt-8">
            <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full bg-[#007DBA] hover:bg-[#005f8d] disabled:opacity-50 text-white font-bold py-3 rounded shadow-lg shadow-sky-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Play size={18} fill="currentColor" />
                Start Scan
            </button>
        </div>
    </div>
);
export default ConfigFormView;