import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { FinancialRecord, FinancialRecordType, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TransactionModal } from './TransactionModal';
import { ReceiptViewerModal } from './ReceiptViewerModal';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  FileText,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const FinanceManager: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialRecord | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    const data = await dbService.getFinanceRecords();
    if (data) setRecords(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleSaveTransaction = async (data: any) => {
    await dbService.addFinanceRecord(data);
    await fetchFinance();
    setShowTransactionModal(false);
  };

  // Check roles: Treasurer, Senior Advisor, President, Secretary
  const canViewContributions = profile?.roles?.some(r => 
    [UserRole.TREASURER, UserRole.SENIOR_ADVISOR, UserRole.PRESIDENT, UserRole.SECRETARY].includes(r)
  ) ?? false;

  const totalContributions = records
    .filter(r => r.type === FinancialRecordType.CONTRIBUTION)
    .reduce((acc, r) => acc + r.amount, 0);

  const totalExpenses = records
    .filter(r => r.type === FinancialRecordType.EXPENSE)
    .reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Treasury</h1>
          <p className="text-slate-500 font-medium mt-1">Manage contributions, expenses, and receipts.</p>
        </div>
        <button 
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 -z-10 group-hover:scale-110 transition-transform" />
          <div className="text-4xl font-light text-slate-900 leading-none">₹{totalContributions.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-emerald-500" />
            Total Contributions
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -translate-y-16 translate-x-16 -z-10 group-hover:scale-110 transition-transform" />
          <div className="text-4xl font-light text-slate-900 leading-none">₹{totalExpenses.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ArrowDownRight size={14} className="text-rose-500" />
            Total Expenses
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200 text-white relative overflow-hidden">
          <div className="text-4xl font-light leading-none">₹{(totalContributions - totalExpenses).toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Available Balance</div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ledger & Receipts</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium focus:outline-none focus:border-slate-300 w-48 transition-all focus:w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 pl-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Receipt No.</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Particulars</th>
                <th className="p-4 pr-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((record, idx) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4 pl-8 text-sm font-medium text-slate-900 whitespace-nowrap">
                    {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      record.type === FinancialRecordType.CONTRIBUTION 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {record.type === FinancialRecordType.CONTRIBUTION ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.receiptUrl || record.receiptNumber ? (
                      <button 
                        onClick={() => setSelectedReceipt(record)}
                        className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        <FileText size={16} />
                        {record.receiptNumber || 'View Receipt'}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-700 max-w-xs truncate">
                    {record.description || (record.type === FinancialRecordType.CONTRIBUTION ? 'Contribution' : 'Expense')}
                  </td>
                  <td className={`p-4 pr-8 text-sm font-bold text-right whitespace-nowrap ${
                    record.type === FinancialRecordType.CONTRIBUTION ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {record.type === FinancialRecordType.CONTRIBUTION ? '+' : '-'}₹{record.amount.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
              
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                    No transactions recorded in the ledger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showTransactionModal && (
        <TransactionModal 
          onClose={() => setShowTransactionModal(false)}
          onSave={handleSaveTransaction}
        />
      )}

      {selectedReceipt && (
        <ReceiptViewerModal
          record={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          canViewContributions={canViewContributions}
        />
      )}
    </div>
  );
};
