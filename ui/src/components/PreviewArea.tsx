import { FileText, ImageIcon, Search, CloudDownload, RotateCw } from "lucide-react";

interface PreviewAreaProps {
    progress: number;
    isScanning: boolean;
    scannedFileUrl: string | null;
    format: string;
}

const PreviewArea = ({ progress, isScanning, scannedFileUrl, format }: PreviewAreaProps) => {

    // Triggers device download using the Blob URL
    const handleDownload = () => {
        if (!scannedFileUrl) return;
        const a = document.createElement('a');
        a.href = scannedFileUrl;
        a.download = `scan_${Date.now()}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="w-full h-full bg-white lg:bg-[#ecf5fe] rounded-xl lg:border lg:border-dashed lg:border-slate-300 flex flex-col relative overflow-hidden lg:items-center lg:justify-center group shadow-sm border border-slate-100 lg:shadow-none">
            <div className="p-4 border-b border-slate-50 shrink-0 lg:hidden">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Preview</h4>
            </div>

            <div className="flex-1 lg:bg-transparent flex items-center justify-center p-8 lg:p-0 relative w-full h-full overflow-hidden">
                <div className={`w-full h-full relative flex items-center justify-center ${progress > 0 && !scannedFileUrl ? 'border border-slate-200 lg:border-none' : 'border border-transparent'}`}>

                    {scannedFileUrl ? (
                        /* Render the Scanned Result */
                        format === 'PDF' ? (
                            <iframe src={scannedFileUrl} className="w-full h-full border-none shadow-2xl bg-white" title="PDF Preview" />
                        ) : (
                            <img src={scannedFileUrl} alt="Scan Result" className="max-w-full max-h-full object-contain shadow-2xl bg-white" />
                        )
                    ) : progress > 0 ? (
                        /* Render Scanning Pulse Animation */
                        <>
                            <div className={`absolute inset-0 bg-slate-50 flex items-center justify-center ${isScanning ? 'animate-pulse' : ''}`}>
                                <FileText size={80} className="text-slate-200" />
                            </div>
                            {isScanning && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_2s_infinite]" />
                            )}
                        </>
                    ) : (
                        /* Render Idle Placeholder */
                        <div className="text-center">
                            <div className="w-full h-full flex items-center justify-center mx-auto mb-4 shadow-sm lg:shadow-none">
                                <ImageIcon className="text-slate-200 lg:hidden" size={48} />
                                <FileText className="text-slate-300 hidden lg:block" size={32} />
                            </div>
                            <p className="text-slate-400 font-medium hidden lg:block">Document Preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Show Toolbars only if a file exists */}
            {scannedFileUrl && (
                <>
                    {/* Toolbar - Mobile Overlay */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2 lg:hidden">
                        <button onClick={handleDownload} className="w-10 h-10 bg-[#007DBA] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90"><CloudDownload size={20} /></button>
                        <button className="w-10 h-10 bg-white/90 backdrop-blur text-[#007DBA] rounded-full shadow-lg flex items-center justify-center active:scale-90"><RotateCw size={20} /></button>
                    </div>

                    {/* Toolbar - Desktop Hover */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-4 py-2 hidden lg:flex items-center gap-6 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-500 hover:text-[#007DBA]"><Search size={18} /></button>
                        <div className="w-px h-4 bg-slate-200" />
                        {/* Added Download Button */}
                        <button onClick={handleDownload} className="text-slate-500 hover:text-[#007DBA]" title="Download File"><CloudDownload size={18} /></button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button className="text-slate-500 hover:text-[#007DBA]"><RotateCw size={18} /></button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PreviewArea;