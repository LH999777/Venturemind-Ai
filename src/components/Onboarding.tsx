import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Wallet, Rocket, ChevronRight, X, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to VentureMind",
      desc: "Your AI-powered business incubator designed to take you from 'Hello World' to 'Hello Revenue'.",
      icon: <Zap className="w-12 h-12 text-white" />,
      color: "bg-black",
      highlights: ["Legal Ventures", "Automated Planning", "Finance Tracking"]
    },
    {
      title: "Meet the AI Strategist",
      desc: "Our Business Agent uses Gemini 3 Flash to generate legal, high-growth strategies specifically for your niche.",
      icon: <Bot className="w-12 h-12 text-white" />,
      color: "bg-[#FF6321]",
      highlights: ["Market Analysis", "Niche Identification", "Actionable Steps"]
    },
    {
      title: "Financial Command",
      desc: "Track every rupee. Link your FamPay account to manage payouts and stay tax-compliant automatically.",
      icon: <Wallet className="w-12 h-12 text-white" />,
      color: "bg-blue-600",
      highlights: ["FamPay Integration", "Instant Withdrawals", "Tax Projections"]
    },
    {
      title: "Go Official",
      desc: "When your venture is ready, follow our deployment roadmap to publish on the Google Play Store.",
      icon: <Rocket className="w-12 h-12 text-white" />,
      color: "bg-purple-600",
      highlights: ["Export Source", "Mobile Wrappers", "Play Store Listing"]
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            hasSeenOnboarding: true,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error(e);
        }
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]"
      >
        {/* Visual Section */}
        <div className={`w-full md:w-1/2 p-12 flex flex-col justify-between transition-colors duration-500 ${steps[step].color}`}>
          <div className="flex justify-between items-start">
             <Sparkles className="text-white/30 w-6 h-6 animate-pulse" />
             <button onClick={onComplete} className="text-white/50 hover:text-white transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-center"
            >
              <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                {steps[step].icon}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
             <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                ))}
             </div>
             <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">Tour Phase {step + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-between bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tight text-black">{steps[step].title}</h2>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                {steps[step].desc}
              </p>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Core Feature</p>
                <div className="flex flex-wrap gap-2">
                   {steps[step].highlights.map((h, i) => (
                     <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f4] rounded-full">
                       <ShieldCheck className="w-3.5 h-3.5 text-black" />
                       <span className="text-[10px] font-bold uppercase tracking-tight">{h}</span>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-8">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              {step === steps.length - 1 ? "Start Launching" : "Next Module"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
