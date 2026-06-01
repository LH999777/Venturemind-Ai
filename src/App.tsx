/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Settings, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  Target,
  FileText,
  CreditCard,
  Zap,
  LogIn,
  LogOut,
  User as UserIcon,
  Rocket,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VentureAgent } from './components/VentureAgent';
import { EcommerceAgent } from './components/EcommerceAgent';
import { FinancialCommand } from './components/FinancialCommand';
import { DeploymentGuide } from './components/DeploymentGuide';
import { Onboarding } from './components/Onboarding';
import { auth, signIn, signOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agent' | 'estore' | 'finance' | 'deployment'>('overview');
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetch('/api/market/trends')
      .then(res => res.json())
      .then(data => setMarketTrends(data))
      .catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setUserData(null);
        setShowOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        if (data && data.hasSeenOnboarding === undefined) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } else {
        // New user with no doc yet
        setShowOnboarding(true);
      }
    });
    return () => unsubscribe();
  }, [user]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f4]">
        <Zap className="w-12 h-12 text-black animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f4] p-6 text-center">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-12 shadow-2xl shadow-black/20">
          <Zap className="text-white w-10 h-10 fill-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">VentureMind AI</h1>
        <p className="text-neutral-500 max-w-sm mb-12 font-medium">Your AI-powered business incubator. Sign in to start building and managing your legal ventures.</p>
        <button 
          onClick={signIn}
          className="px-12 py-5 bg-black text-white rounded-3xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <LogIn className="w-6 h-6" /> Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#f5f5f4]">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-[#e5e5e0] z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center animate-pulse">
            <Zap className="text-white w-4.5 h-4.5 fill-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">VentureMind</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold border border-green-200">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
            LIVE
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Sign out of VentureMind AI?")) {
                signOut();
              }
            }}
            title="Sign Out"
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center border border-[#e5e5e0] hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <img src={user.photoURL || ''} alt="" className="w-7 h-7 rounded-full bg-neutral-200" />
          </button>
        </div>
      </header>

      {/* Sidebar Rail - Desktop and Tablet */}
      <nav className="hidden md:flex w-20 lg:w-64 flex-shrink-0 bg-white border-r border-[#e5e5e0] flex-col items-center lg:items-stretch py-8">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight">VentureMind</span>
        </div>

        <div className="flex-1 space-y-2 px-3">
          <SidebarNav 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarNav 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="AI Agent" 
            active={activeTab === 'agent'} 
            onClick={() => setActiveTab('agent')} 
          />
          <SidebarNav 
            icon={<ShoppingBag className="w-5 h-5" />} 
            label="E-Store Agent" 
            active={activeTab === 'estore'} 
            onClick={() => setActiveTab('estore')} 
          />
          <SidebarNav 
            icon={<Wallet className="w-5 h-5" />} 
            label="Finance" 
            active={activeTab === 'finance'} 
            onClick={() => setActiveTab('finance')} 
          />
          <SidebarNav 
            icon={<Rocket className="w-5 h-5" />} 
            label="Deployment" 
            active={activeTab === 'deployment'} 
            onClick={() => setActiveTab('deployment')} 
          />
        </div>

        <div className="px-3 border-t border-[#e5e5e0] pt-6 flex flex-col space-y-2">
          <div className="px-3 py-4 mb-2 flex items-center gap-3 bg-[#f9f9f8] rounded-2xl mx-1">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-neutral-200" />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] text-neutral-400 font-medium truncate">{user.email}</p>
            </div>
          </div>
          <SidebarNav 
            icon={<LogOut className="w-5 h-5" />} 
            label="Sign Out" 
            onClick={signOut} 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-full md:h-screen pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-5 md:p-12">
          
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Hero Header */}
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 md:gap-12">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                      <Target className="w-4 h-4 text-[#FF6321]" /> Incubator Status: Active
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.0] text-black">
                      Launch Your Next <span className="text-[#FF6321]">Venture.</span>
                    </h1>
                  </div>
                  <button 
                    onClick={() => setActiveTab('agent')}
                    className="flex h-14 w-full sm:h-32 sm:w-32 rounded-2xl sm:rounded-full bg-black text-white flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 p-4 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg shadow-black/10"
                  >
                    <Plus className="w-5 h-5 sm:w-8 sm:h-8 sm:mb-1" />
                    <span className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-center">New Idea</span>
                  </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Stats section */}
                  <StatCard label="Total Valuation" value="₹0.00" sub="Potential across active ideas" icon={<BarChart3 />} />
                  <StatCard label="Active Leads" value="12" sub="+4 this week from AI trends" icon={<Briefcase />} />
                  <StatLink label="FamPay Account" value={userData?.fampayId ? "Linked" : "Not Linked"} sub={userData?.fampayId || "Configure payouts"} icon={<Wallet />} onClick={() => setActiveTab('finance')} />
                </div>

                {/* Market Intelligence Grid */}
                <section className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Market Intelligence</h2>
                    <span className="text-xs sm:text-sm font-medium text-neutral-500">Live Gemini Pulse</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {marketTrends.length > 0 ? marketTrends.map((trend, i) => (
                      <div key={i} className="group p-6 bg-white border border-[#e5e5e0] rounded-3xl hover:border-black transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-base sm:text-lg">{trend.name}</h3>
                          <span className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold rounded-full">{trend.monthly_revenue || 'v1.0'}</span>
                        </div>
                        <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                          {trend.growth_reason}
                        </p>
                        <button 
                          onClick={() => setActiveTab('agent')}
                          className="flex items-center text-xs font-bold uppercase tracking-widest gap-2 group-hover:gap-3 transition-all cursor-pointer text-[#FF6321]"
                        >
                          Explore Niche <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )) : (
                      [1,2,3,4].map(i => (
                        <div key={i} className="h-48 bg-white border border-[#e5e5e0] rounded-3xl animate-pulse" />
                      ))
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'agent' && (
              <motion.div 
                key="agent"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <VentureAgent />
              </motion.div>
            )}

            {activeTab === 'estore' && (
              <motion.div 
                key="estore"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <EcommerceAgent />
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FinancialCommand userData={userData} />
              </motion.div>
            )}

            {activeTab === 'deployment' && (
              <motion.div 
                key="deployment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DeploymentGuide />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Right Column / Quick Actions Desktop */}
      <aside className="hidden xl:flex w-80 bg-[#f9f9f8] border-l border-[#e5e5e0] flex-col p-8 space-y-8">
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Action Plan</h3>
          <div className="space-y-4">
            <TodoItem label="Link FamPay Account" done={!!userData?.fampayId} />
            <TodoItem label="Generate first idea" done={true} />
            <TodoItem label="Define MVP features" done={false} />
            <TodoItem label="Market survey AI draft" done={false} />
          </div>
        </div>

        <div className="p-6 bg-black rounded-3xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <CreditCard className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Connected Account</p>
          <p className="font-mono text-sm mb-8 uppercase tracking-widest truncate">{userData?.fampayId || 'NO ACCOUNT LINKED'}</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] opacity-60 uppercase mb-1">Status</p>
              <p className="text-xs font-bold tracking-tight">{userData?.fampayId ? 'PAYOUTS ENABLED' : 'PENDING SETUP'}</p>
            </div>
            <img src="https://fampay.in/assets/icons/fampay_logo.png" alt="" className="h-3 opacity-50 grayscale contrast-200" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#e5e5e0] flex justify-around py-3.5 px-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {[
          { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-5 h-5" /> },
          { id: 'agent', label: 'AI Agent', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'estore', label: 'E-Store', icon: <ShoppingBag className="w-5 h-5" /> },
          { id: 'finance', label: 'Finance', icon: <Wallet className="w-5 h-5" /> },
          { id: 'deployment', label: 'Deployment', icon: <Rocket className="w-5 h-5" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex flex-col items-center gap-1.5 py-1 px-3.5 relative cursor-pointer"
            >
              <div className={`transition-all duration-200 ${isActive ? 'text-[#FF6321] scale-110' : 'text-neutral-400 hover:text-neutral-600'}`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-bold tracking-widest uppercase ${isActive ? 'text-black' : 'text-neutral-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute -bottom-1 w-6 h-0.5 bg-[#FF6321] rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SidebarNav({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
        active ? 'bg-black text-white shadow-lg' : 'text-neutral-500 hover:bg-[#f0f0ef] hover:text-black'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="hidden lg:block text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#e5e5e0] relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 font-bold text-4xl opacity-[0.03] group-hover:scale-110 transition-transform whitespace-nowrap">
        {label}
      </div>
      <div className="w-10 h-10 bg-[#f5f5f4] rounded-xl flex items-center justify-center mb-6 text-black group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-[10px] font-medium text-neutral-500">{sub}</p>
    </div>
  );
}

function StatLink({ label, value, sub, icon, onClick }: { label: string, value: string, sub: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-[#e5e5e0] relative overflow-hidden group text-left w-full hover:border-black transition-colors"
    >
      <div className="absolute right-0 top-0 p-4 font-bold text-4xl opacity-[0.03] group-hover:scale-110 transition-transform whitespace-nowrap">
        {label}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${value === 'Linked' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#FF6321]'}`}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold mb-1 ${value === 'Linked' ? 'text-green-600' : 'text-[#FF6321]'}`}>{value}</p>
      <p className="text-[10px] font-medium text-neutral-500 truncate">{sub}</p>
    </button>
  );
}

function TodoItem({ label, done }: { label: string, done: boolean }) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
        done ? 'bg-black border-black text-white' : 'border-neutral-300 group-hover:border-black'
      }`}>
        {done && <Plus className="w-3 h-3 rotate-45" />}
      </div>
      <span className={`text-xs font-medium ${done ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
        {label}
      </span>
    </div>
  );
}
