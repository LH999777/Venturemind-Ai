import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface FamPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export function FamPayModal({ isOpen, onClose, onSuccess }: FamPayModalProps) {
  const [fampayId, setFampayId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fampayId.trim() || !auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(userRef, {
          fampayId: fampayId.trim(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          fampayId: fampayId.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      onSuccess(fampayId);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Failed to link account. Please try again.");
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
            <div className="absolute top-0 right-0 p-6">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#f5f5f4] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="mb-8">
              <div className="w-14 h-14 bg-[#FF6321] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                <CreditCard className="text-white w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Link FamPay</h2>
              <p className="text-neutral-500 text-sm font-medium">Enter your FamPay UPI ID or Mobile Number to receive instant payouts from your ventures.</p>
            </div>

            <form onSubmit={handleLink} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">FamPay ID / UPI</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@fampay"
                  value={fampayId}
                  onChange={(e) => setFampayId(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#e5e5e0] rounded-2xl py-4 px-6 focus:outline-none focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321] transition-all font-medium"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl">{error}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Link Account <ShieldCheck className="w-4 h-4" /></>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 py-4 grayscale opacity-50">
                <img src="https://fampay.in/assets/icons/fampay_logo.png" alt="FamPay" className="h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Secure Integration</span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
