import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, MoreHorizontal, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { FamPayModal } from './FamPayModal';
import { WithdrawModal } from './WithdrawModal';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export function FinancialCommand({ userData }: { userData?: any }) {
  const [isFamModalOpen, setIsFamModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [recentPayouts, setRecentPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const payoutsRef = collection(db, 'users', auth.currentUser.uid, 'payouts');
    const q = query(payoutsRef, orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setRecentPayouts(payouts);
      setLoadingPayouts(false);
    }, (err) => {
      console.error(err);
      setLoadingPayouts(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPayoutVolume = recentPayouts.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Financial Command</h2>
          <p className="text-neutral-500 font-medium text-sm">Manage your earnings and payouts.</p>
        </div>
        <button 
          onClick={() => userData?.fampayId ? setIsWithdrawModalOpen(true) : setIsFamModalOpen(true)}
          className="w-full sm:w-auto px-6 py-4 bg-black text-white rounded-2xl font-bold text-sm tracking-tight hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/10"
        >
          {userData?.fampayId ? (
            <><ArrowUpRight className="w-4 h-4" /> Withdraw Funds</>
          ) : (
            <><LinkIcon className="w-4 h-4" /> Link FamPay Account</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Balance Display */}
          <div className="relative h-auto sm:h-64 bg-neutral-900 rounded-[2.5rem] p-6 sm:p-10 text-white overflow-hidden group py-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6321] opacity-20 blur-[100px] -mr-32 -mt-32 transition-all group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-8 sm:gap-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Total Withdrawals</p>
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">₹{totalPayoutVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Available</p>
                    <p className="text-sm font-bold tracking-tight">₹0.00</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">In Process</p>
                    <p className="text-sm font-bold tracking-tight">₹{recentPayouts.filter(p => p.status === 'pending').reduce((a, b) => a + (b.amount || 0), 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex absolute bottom-10 right-10 items-center gap-2 text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] writing-vertical">
              VentureMind Finance
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white border border-[#e5e5e0] rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Ledger</h3>
              <button className="text-neutral-400 hover:text-black transition-colors">
                <MoreHorizontal />
              </button>
            </div>

            <div className="space-y-1">
              {loadingPayouts ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : recentPayouts.length > 0 ? (
                recentPayouts.map(p => (
                  <TransactionItem 
                    key={p.id}
                    title="Withdrawal Request" 
                    date={p.createdAt?.toLocaleDateString() || 'Pending...'} 
                    amount={`₹${p.amount?.toLocaleString('en-IN')}`} 
                    status={p.status}
                  />
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 opacity-50 space-y-2">
                  <Clock className="w-12 h-12 stroke-[1px]" />
                  <p className="text-xs font-bold uppercase tracking-widest">No activity found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Linked Account Card */}
          <div className="p-8 bg-white border border-[#e5e5e0] rounded-[2rem] space-y-8">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-[#F9F9F9] border border-[#e5e5e0] rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${userData?.fampayId ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                {userData?.fampayId ? 'Linked' : 'Not Linked'}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payout Account</p>
              <h4 className="text-xl font-bold tracking-tight italic font-serif truncate">{userData?.fampayId || 'Setup Required'}</h4>
              <p className="text-xs font-medium text-neutral-500">{userData?.fampayId ? 'Verified payout route' : 'Link your account to receive funds'}</p>
            </div>

            <div className="pt-4 border-t border-[#f0f0ef]">
              <div className="flex items-center gap-2 text-green-600 mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {userData?.fampayId ? 'KYC Verified' : 'Compliance Ready'}
                </span>
              </div>
              <button 
                onClick={() => setIsFamModalOpen(true)}
                className="w-full py-4 border border-[#e5e5e0] rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 transition-colors"
              >
                {userData?.fampayId ? 'Update Payout Method' : 'Configure FamPay'}
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-8 bg-[#FF6321] rounded-[2rem] text-white space-y-6 shadow-xl shadow-orange-500/20">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Tax Projected (2026)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">₹0</span>
              <span className="text-xs font-medium opacity-50">GST @ 18%</span>
            </div>
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-white" />
            </div>
            <p className="text-[10px] font-medium leading-relaxed opacity-70 italic">
              "Building legally means staying ahead of your compliance. VentureMind tracks this for you."
            </p>
          </div>
        </div>
      </div>

      <FamPayModal 
        isOpen={isFamModalOpen} 
        onClose={() => setIsFamModalOpen(false)} 
        onSuccess={() => {}} 
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        linkedAccount={userData?.fampayId}
      />
    </div>
  );
}

const TransactionItem: React.FC<{ 
  title: string, 
  date: string, 
  amount: string, 
  status: 'pending' | 'completed' | 'failed' 
}> = ({ title, date, amount, status }) => {
  const typeMap = {
    pending: { color: 'text-orange-500', bg: 'bg-orange-50', icon: <Clock className="w-5 h-5" /> },
    completed: { color: 'text-green-600', bg: 'bg-green-50', icon: <ShieldCheck className="w-5 h-5" /> },
    failed: { color: 'text-red-500', bg: 'bg-red-50', icon: <X className="w-5 h-5" /> }
  };

  const style = typeMap[status] || typeMap.pending;

  return (
    <div className="flex justify-between items-center py-4 border-b border-[#f0f0ef] last:border-0 group cursor-pointer hover:bg-neutral-50 px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.color}`}>
          {style.icon}
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight group-hover:text-[#FF6321] transition-colors">{title}</h4>
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold tracking-tight ${style.color}`}>{amount}</p>
        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>{status}</p>
      </div>
    </div>
  );
};

