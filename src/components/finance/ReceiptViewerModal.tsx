import React from 'react';
import { X, Download, Printer, FileText } from 'lucide-react';
import { FinancialRecord } from '../../types';

interface Props {
  record: FinancialRecord;
  onClose: () => void;
  canViewContributions: boolean;
}

export const ReceiptViewerModal: React.FC<Props> = ({ record, onClose, canViewContributions }) => {
  const handlePrint = () => {
    if (!record.receiptUrl) return;
    
    // For PDFs, we can open them in a new window which has built-in print options
    if (record.receiptUrl.startsWith('data:application/pdf')) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${record.receiptUrl}" width="100%" height="100%" style="border:none;"></iframe>`);
      }
      return;
    }

    // Open image in new window and print
    const win = window.open('');
    if (win) {
      win.document.write(`<img src="${record.receiptUrl}" style="max-width: 100%;" />`);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 250);
    }
  };

  const handleDownload = () => {
    if (!record.receiptUrl) return;
    const a = document.createElement('a');
    a.href = record.receiptUrl;
    
    const isPdf = record.receiptUrl.startsWith('data:application/pdf');
    a.download = `receipt-${record.receiptNumber || 'download'}.${isPdf ? 'pdf' : 'jpg'}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl overflow-hidden my-8 flex flex-col md:flex-row h-[80vh]">
        {/* Left Side: Image Viewer */}
        <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center min-h-[400px] h-full overflow-hidden p-0 relative">
          {record.receiptUrl ? (
            record.receiptUrl.startsWith('data:application/pdf') ? (
              <iframe 
                src={record.receiptUrl} 
                className="w-full h-full border-none"
                title="Receipt PDF"
              />
            ) : (
              <img 
                src={record.receiptUrl} 
                alt="Receipt" 
                className="max-w-full max-h-full object-contain" 
              />
            )
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <FileText size={48} className="mb-4 opacity-50" />
              <div className="font-bold uppercase tracking-widest text-sm">No Receipt File</div>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-96 p-8 flex flex-col bg-white overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Receipt Details</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">#{record.receiptNumber || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</div>
              <div className="font-medium text-slate-900">{record.receiptDate || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</div>
              <div className="text-2xl font-light text-emerald-600">₹{record.amount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Particulars</div>
              <div className="font-medium text-slate-900">{record.description || 'Not specified'}</div>
            </div>

            {record.memberContributions && record.memberContributions.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Member Contributions</div>
                {canViewContributions ? (
                  <div className="space-y-2">
                    {record.memberContributions.map((c, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">{c.name}</span>
                        <span className="font-bold text-slate-900">₹{c.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Restricted Access</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-6 mt-6 border-t border-slate-100">
            <button 
              onClick={handleDownload}
              className="flex-1 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
