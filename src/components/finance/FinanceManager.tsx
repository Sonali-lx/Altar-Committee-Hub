import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { FinancialRecord, FinancialRecordType } from '../../types';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Plus,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const FinanceManager: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      const data = await dbService.getFinanceRecords();
      if (data) setRecords(data as any);
      setLoading(false);
    };
    fetchFinance();
  }, []);

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
          <p className="text-slate-500 font-medium mt-1">Tracking monthly state contributions and event expenses.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200">
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 -z-10 group-hover:scale-110 transition-transform" />
          <div className="text-4xl font-light text-slate-900 leading-none">${totalContributions.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-emerald-500" />
            Total Contributions
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -translate-y-16 translate-x-16 -z-10 group-hover:scale-110 transition-transform" />
          <div className="text-4xl font-light text-slate-900 leading-none">${totalExpenses.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ArrowDownRight size={14} className="text-rose-500" />
            Total Expenses
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200 text-white">
          <div className="text-4xl font-light leading-none">${(totalContributions - totalExpenses).toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Available Balance</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Filter size={18} /></button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {records.map((record, idx) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${record.type === FinancialRecordType.CONTRIBUTION ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {record.type === FinancialRecordType.CONTRIBUTION ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{record.description || (record.type === FinancialRecordType.CONTRIBUTION ? `${record.userName} - State Contribution` : 'Event Expense')}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {record.month} {record.year} &bull; {format(new Date(record.createdAt), 'MMM dd, H:mm')}
                </div>
              </div>
              <div className={`text-sm font-bold ${record.type === FinancialRecordType.CONTRIBUTION ? 'text-emerald-600' : 'text-rose-600'}`}>
                {record.type === FinancialRecordType.CONTRIBUTION ? '+' : '-'}${record.amount.toLocaleString()}
              </div>
            </motion.div>
          ))}

          {records.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
              No transactions recorded in the ledger
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
