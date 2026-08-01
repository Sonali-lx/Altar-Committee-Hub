import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { FinancialRecordType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const TransactionModal: React.FC<Props> = ({ onClose, onSave }) => {
  const { user, profile } = useAuth();
  const [type, setType] = useState<FinancialRecordType>(FinancialRecordType.CONTRIBUTION);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [memberContributions, setMemberContributions] = useState<{name: string, amount: number}[]>([]);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setReceiptUrl(base64); // show preview

      // extract
      setIsExtracting(true);
      try {
        const parts = base64.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const data = parts[1];

        const response = await fetch('/api/extract-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: data, mimeType }),
        });

        if (!response.ok) throw new Error('Extraction failed');
        const extracted = await response.json();
        
        if (extracted.totalAmount) setAmount(extracted.totalAmount.toString());
        if (extracted.receiptNumber) setReceiptNumber(extracted.receiptNumber);
        if (extracted.receiptDate) setReceiptDate(extracted.receiptDate);
        if (extracted.memberContributions) setMemberContributions(extracted.memberContributions);
        
      } catch (error) {
        console.error('Failed to extract receipt:', error);
        alert('Failed to automatically extract receipt data. Please enter manually.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      type,
      amount: Number(amount),
      description,
      receiptNumber,
      receiptDate,
      receiptUrl,
      memberContributions,
      userId: user?.uid,
      userName: profile?.name,
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">Record Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Receipt Upload</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            
            {!receiptUrl ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors hover:bg-slate-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span className="text-sm font-medium">Extracting AI Data...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2" size={24} />
                    <span className="text-sm font-medium">Click to upload receipt (Image or PDF)</span>
                    <span className="text-xs mt-1 opacity-75">AI will auto-fill the details</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                  {receiptUrl.startsWith('data:image') ? (
                    <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                  ) : receiptUrl.startsWith('data:application/pdf') ? (
                    <div className="text-center flex flex-col items-center">
                      <FileText size={32} className="text-slate-300 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF File</span>
                    </div>
                  ) : (
                    <ImageIcon size={32} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-900">Receipt Attached</span>
                    {isExtracting && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Extracting</span>}
                  </div>
                  <button 
                    onClick={() => {
                      setReceiptUrl('');
                      setReceiptNumber('');
                      setReceiptDate('');
                      setMemberContributions([]);
                      setAmount('');
                    }}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Remove Receipt
                  </button>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transaction Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as FinancialRecordType)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={FinancialRecordType.CONTRIBUTION}>Contribution (Income)</option>
                  <option value={FinancialRecordType.EXPENSE}>Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Receipt Number</label>
                <input 
                  type="text" 
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Receipt Date</label>
                <input 
                  type="text" 
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. 11-Sep-25"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Particulars / Description</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="What is this transaction for?"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest">Member Contributions</label>
                <button 
                  type="button"
                  onClick={() => setMemberContributions([...memberContributions, { name: '', amount: 0 }])}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Add Member
                </button>
              </div>
              <div className="space-y-3">
                {memberContributions.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-2">No individual contributions added.</div>
                ) : (
                  memberContributions.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const newC = [...memberContributions];
                          newC[idx].name = e.target.value;
                          setMemberContributions(newC);
                        }}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
                        placeholder="Member Name"
                      />
                      <input 
                        type="number"
                        value={c.amount || ''}
                        onChange={(e) => {
                          const newC = [...memberContributions];
                          newC[idx].amount = Number(e.target.value);
                          setMemberContributions(newC);
                        }}
                        className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
                        placeholder="Amount"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newC = [...memberContributions];
                          newC.splice(idx, 1);
                          setMemberContributions(newC);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving || isExtracting}
              className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
