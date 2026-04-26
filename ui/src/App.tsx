import { useState, useEffect } from 'react';
import {
  Settings,
  FolderOpen,
  Info,
  Printer,
  CloudDownload,
  User,
  Menu,
  History,
  Play
} from 'lucide-react';
import HistoryRecordsView from './components/HistoryRecordsView';
import PreviewArea from './components/PreviewArea';
import ScannerInfoView from './components/ScannerInfoView';
import ConfigFormView from './components/ConfigFormView';
import { socket } from '../utils/socket';

// --- Types ---
type FileFormat = 'PDF' | 'PNG';
type ColorMode = 'RGB Color' | 'Black & White' | 'Grayscale';
type Resolution = '72 DPI' | '150 DPI' | '300 DPI (Standard)' | '600 DPI (High)';
type TabType = 'scan' | 'history' | 'settings';

interface ScanConfig {
  format: FileFormat;
  colorMode: ColorMode;
  resolution: Resolution;
}

interface HistoryRecord {
  id: string;
  name: string;
  date: string;
  format: FileFormat;
  size: string;
}

// --- Shared Sub-components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
    <div
      className="bg-[#007DBA] h-full transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('scan');

  const [config, setConfig] = useState<ScanConfig>({
    format: 'PDF',
    colorMode: 'RGB Color',
    resolution: '300 DPI (Standard)'
  });

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [scannedFileUrl, setScannedFileUrl] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      // Simulating fetching records from an endpoint
      await new Promise(resolve => setTimeout(resolve, 800));

      setHistoryRecords([
        { id: '1', name: 'Tax_Return_2023.pdf', date: 'Oct 24, 2023', format: 'PDF', size: '2.4 MB' },
        { id: '2', name: 'Receipt_Lunch.png', date: 'Oct 23, 2023', format: 'PNG', size: '840 KB' },
        { id: '3', name: 'Contract_Signed.pdf', date: 'Oct 20, 2023', format: 'PDF', size: '1.1 MB' },
        { id: '4', name: 'Sketch_Draft.png', date: 'Oct 15, 2023', format: 'PNG', size: '3.1 MB' },
      ]);
      setIsLoadingHistory(false);
    };

    fetchHistory();
  }, []);

  const handleScan = async () => {
    if (isScanning) return;
    try {
      setIsScanning(true);
      setProgress(0);
      setScannedFileUrl(null);

      const response = await fetch('/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('activeScanJobId', data.jobId);
        socket.emit('track_job', data.jobId);
      }
    }
    catch (e) {
      console.error("Failed to start scan:", e);
      setIsScanning(false);
    }
  };


  useEffect(() => {
    // Check if we have an active job on reload
    const activeJobId = sessionStorage.getItem('activeScanJobId');
    if (activeJobId) {
      socket.emit('track_job', activeJobId);
    }

    const onRestored = (data: { progress: number }) => {
      setIsScanning(true);
      setProgress(data.progress);
    };

    const onProgress = (data: { progress: number }) => {
      setProgress(data.progress);
    };

    const onComplete = async (data: { file: string }) => {
      setProgress(100);
      setIsScanning(false);
      sessionStorage.removeItem('activeScanJobId');

      // Fetch the file as a Blob to use locally for preview AND download
      try {
        const res = await fetch(`/download/${data.file}`);
        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        setScannedFileUrl(localUrl);
      } catch (err) {
        console.error("Failed to load scanned file", err);
      }
    };

    const onError = (data: { error: string }) => {
      setIsScanning(false);
      sessionStorage.removeItem('activeScanJobId');
      console.error("Scan Error:", data.error);
    };

    socket.on('scan_restored', onRestored);
    socket.on('scan_progress', onProgress);
    socket.on('scan_complete', onComplete);
    socket.on('scan_error', onError);

    return () => {
      socket.off('scan_restored', onRestored);
      socket.off('scan_progress', onProgress);
      socket.off('scan_complete', onComplete);
      socket.off('scan_error', onError);
    };
  }, []);
  const tabs = [
    { id: 'scan', label: 'SCAN SETTINGS', icon: Settings },
    { id: 'history', label: 'HISTORY', icon: FolderOpen },
    { id: 'settings', label: 'SCANNER INFO', icon: Info },
  ] as const;

  return (
    <>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col h-screen bg-[#f6faff] font-['Inter'] text-slate-900 overflow-hidden">
        {/* Unified Top App Bar */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 lg:hidden text-[#007DBA]">
              <Menu size={24} />
            </button>
            <span className="text-lg lg:text-xl font-bold text-[#007DBA]">ScanPro Utility</span>
          </div>
          <div className="flex items-center gap-1 lg:gap-4 text-slate-500">
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hidden lg:block"><Printer size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hidden lg:block"><CloudDownload size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-[#007DBA] lg:text-slate-500"><User size={24} className="lg:w-5 lg:h-5" /></button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="w-80 border-r border-slate-200 bg-white hidden lg:flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Device Controls</h2>
              <p className="text-xs text-slate-500 mt-1">HP DeskJet 2600 Ready</p>
            </div>

            <nav className="py-2 border-b border-slate-100 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-semibold tracking-wider transition-colors border-l-4 ${activeTab === tab.id
                    ? 'text-[#007DBA] bg-slate-50 border-[#007DBA]'
                    : 'text-slate-500 hover:bg-slate-50 border-transparent'
                    }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-hidden bg-slate-50/50">
              {activeTab === 'scan' && <ConfigFormView isScanning={isScanning} config={config} setConfig={setConfig} handleScan={handleScan} />}
              {activeTab === 'history' && <HistoryRecordsView isLoadingHistory={isLoadingHistory} historyRecords={historyRecords} />}
              {activeTab === 'settings' && <ScannerInfoView />}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-hidden pb-24 lg:pb-8">
            {/* Desktop always shows Preview. 
              Mobile conditionally shows Preview, History, or Config based on activeTab.
            */}
            <div className={`flex-col h-full space-y-4 lg:space-y-8 ${activeTab === 'scan' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="bg-white border border-slate-100 lg:border-slate-200 rounded-xl lg:rounded-lg p-5 lg:p-6 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                  <h3 className="font-bold text-slate-800 text-sm lg:text-base">
                    {isScanning ? `Scanning page 1...` : progress === 100 ? 'Scan Complete' : 'Status: Ready'}
                  </h3>
                  <span className="text-[#007DBA] font-mono font-bold text-xs lg:text-sm">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} />
              </div>
              <PreviewArea isScanning={isScanning} progress={progress} scannedFileUrl={scannedFileUrl}
                format={config.format} />
            </div>

            {/* Mobile Tab Views (Hidden on Desktop) */}
            <div className={`h-full lg:hidden ${activeTab === 'history' ? 'block' : 'hidden'}`}>
              <HistoryRecordsView isLoadingHistory={isLoadingHistory} historyRecords={historyRecords} />
            </div>

            <div className={`h-full lg:hidden ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
              {/* Show both Config and Scanner Info on Mobile Settings Tab for utility */}
              <div className="space-y-4 overflow-y-auto h-full pb-4">
                <ScannerInfoView />
                <ConfigFormView isScanning={isScanning} config={config} setConfig={setConfig} handleScan={handleScan} />
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Floating Action Button */}
        {activeTab === 'scan' && (
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="lg:hidden fixed right-6 bottom-20 w-14 h-14 bg-[#007DBA] text-white rounded-2xl shadow-xl shadow-sky-200 flex items-center justify-center active:scale-90 transition-transform z-20"
          >
            <Play fill="currentColor" size={24} />
          </button>
        )}

        {/* Mobile Bottom Nav */}
        <nav className="h-16 bg-white border-t border-slate-100 fixed bottom-0 left-0 w-full flex lg:hidden justify-around items-center px-4 z-10 pb-safe">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'scan' ? 'text-[#007DBA]' : 'text-slate-400'}`}
          >
            <Play size={20} fill={activeTab === 'scan' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-[#007DBA]' : 'text-slate-400'}`}
          >
            <History size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-[#007DBA]' : 'text-slate-400'}`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default App;