import React, { useState } from 'react';
import { X, ArrowUpRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedAccount: string | null;
}

export function WithdrawModal({ isOpen, onClose, linkedAccount }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    if (!linkedAccount) {
      setError("Please link your FamPay account first.");
      return;
    }

    if (!auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const payoutsRef = collection(db, 'users', auth.currentUser.uid, 'payouts');
      await addDoc(payoutsRef, {
        userId: auth.currentUser.uid,
        amount: numAmount,
        status: 'pending',
        targetAccount: linkedAccount,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("Withdrawal failed. Ensure amount is positive and account is linked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
          >
            {success ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Withdrawal Initiated</h2>
                  <p className="text-neutral-500 font-medium">Your request for ₹{amount} is being processed.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={onClose} className="p-2 hover:bg-[#f5f5f4] rounded-full transition-colors">
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                    <ArrowUpRight className="text-white w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Request Payout</h2>
                  <p className="text-neutral-500 text-sm font-medium">Funds will be transferred to your linked FamPay ID.</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Withdraw Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-neutral-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#e5e5e0] rounded-2xl py-4 pl-10 pr-6 focus:outline-none focus:border-black transition-all font-mono font-bold text-xl"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-[#f5f5f4] rounded-2xl border border-[#e5e5e0] space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Target Account</p>
                    <p className="text-sm font-bold truncate">{linkedAccount || "No account linked"}</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !linkedAccount}
                      className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Confirm Withdrawal <ArrowUpRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
