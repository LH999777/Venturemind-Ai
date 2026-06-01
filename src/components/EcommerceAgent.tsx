import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Play, Pause, TrendingUp, Package, Percent, Megaphone, 
  MessageSquare, BarChart3, Sparkles, Send, RefreshCw, AlertCircle, 
  ArrowUpRight, Plus, HelpCircle, Check, ShieldAlert, BadgeInfo,
  DollarSign, Landmark, ArrowDownRight, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  acquisitionCost: number;
  price: number;
  originalPrice: number;
  stock: number;
  sold: number;
  revenue: number;
  demandFactor: number;
}

interface Campaign {
  id: string;
  productName: string;
  channel: string;
  budget: number;
  spent: number;
  ctr: number;
  salesCount: number;
  revenue: number;
  adCopy: string;
  status: 'active' | 'completed';
}

interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  orderId: string;
  status: 'pending' | 'resolved';
  reply?: string;
  actionTaken?: string;
  notes?: string;
  createdAt: string;
}

interface FinancialWeek {
  weekNumber: number;
  grossSales: number;
  inventoryCosts: number;
  marketingSpend: number;
  supportOverhead: number;
  hostingFees: number;
  netProfit: number;
  profitMargin: number;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'market' | 'inventory' | 'pricing' | 'marketing' | 'support' | 'finance';
  text: string;
}

const SUPPORT_TEMPLATES = [
  { name: "Rahul Sharma", email: "rahul@gmail.com", subject: "Delayed Shipment Check", message: "Where is my ordered smart accessory? It's been 5 days and I haven't received a tracking update.", orderId: "VM-9018A" },
  { name: "Sneha Patil", email: "sneha.patil@outlook.com", subject: "Received Damaged Item", message: "My premium ecofriendly container arrived with a visible scratch on the wood casing. Can I get a replacement?", orderId: "VM-4219P" },
  { name: "Vikram Sen", email: "vsen90@yahoo.com", subject: "Refund Query", message: "The item specs don't suit my household. I want to return it and request a statutory refund under standard consumer laws.", orderId: "VM-1104S" }
];

export function EcommerceAgent() {
  // Store Niche Selection state
  const [niche, setNiche] = useState<string>('Eco-Friendly Goods');
  const [isStoreSetup, setIsStoreSetup] = useState<boolean>(false);
  
  // Simulation and Store State
  const [storeName, setStoreName] = useState<string>('EcoSpheres Autopilot');
  const [balance, setBalance] = useState<number>(35000); // Starting capital (₹)
  const [isAutopilotRunning, setIsAutopilotRunning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'catalog' | 'marketing' | 'support' | 'reports'>('monitor');
  const [simulatedDay, setSimulatedDay] = useState<number>(1);
  
  // State Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [weeksHistory, setWeeksHistory] = useState<FinancialWeek[]>([]);
  const [agentLogs, setAgentLogs] = useState<LogEntry[]>([]);
  
  // Live interactions & loaders
  const [discoveryLoading, setDiscoveryLoading] = useState<boolean>(false);
  const [campaignLoading, setCampaignLoading] = useState<boolean>(false);
  const [supportLoading, setSupportLoading] = useState<boolean>(false);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<string>('');
  
  // Forms & Inputs
  const [customTicketMsg, setCustomTicketMsg] = useState<string>('');
  const [customTicketName, setCustomTicketName] = useState<string>('');
  const [pricingMultiplier, setPricingMultiplier] = useState<number>(3.0); // wholesale -> retail markup margin
  const [selectedProductForAd, setSelectedProductForAd] = useState<string>('');
  const [adChannel, setAdChannel] = useState<string>('Instagram');
  const [adBudget, setAdBudget] = useState<number>(1500);

  // Auto-ref for autoscrolling log panel
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Restore previous save on load
  useEffect(() => {
    const saved = localStorage.getItem('venturemind_ecommerce_store_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNiche(parsed.niche || 'Eco-Friendly Goods');
        setStoreName(parsed.storeName || 'EcoSpheres Autopilot');
        setBalance(parsed.balance || 35000);
        setProducts(parsed.products || []);
        setCampaigns(parsed.campaigns || []);
        setTickets(parsed.tickets || []);
        setWeeksHistory(parsed.weeksHistory || []);
        setAgentLogs(parsed.agentLogs || []);
        setSimulatedDay(parsed.simulatedDay || 1);
        setIsStoreSetup(parsed.isStoreSetup || false);
      } catch (e) {
        console.error("Error loading stored store config", e);
      }
    }
  }, []);

  // Save current store data to local storage on state mutations
  const saveStoreState = (
    n: string, sName: string, bal: number, prod: Product[], 
    camps: Campaign[], ticks: Ticket[], weeks: FinancialWeek[], 
    logs: LogEntry[], day: number, setup: boolean
  ) => {
    const state = {
      niche: n, storeName: sName, balance: bal, products: prod,
      campaigns: camps, tickets: ticks, weeksHistory: weeks,
      agentLogs: logs, simulatedDay: day, isStoreSetup: setup
    };
    localStorage.setItem('venturemind_ecommerce_store_v1', JSON.stringify(state));
  };

  // Autoscroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  // Push new log line helper
  const addLog = (type: LogEntry['type'], text: string) => {
    const newLog: LogEntry = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      text
    };
    setAgentLogs(prev => {
      const next = [...prev, newLog];
      if (next.length > 30) next.shift(); // keep last 30 logs for performance
      return next;
    });
  };

  // 1. Initialise & Build Store
  const initializeStore = async (selectedNiche: string) => {
    setDiscoveryLoading(true);
    const storeBrandNames: Record<string, string> = {
      "Eco-Friendly Goods": "EcoSpheres Autopilot",
      "Smart Tech Gadgets": "Synapse SmartStore AI",
      "Sustainable Living": "GreenNest Automarkets",
      "Minimalist Apparel": "CleanThreads AI Clothing"
    };

    const name = storeBrandNames[selectedNiche] || `${selectedNiche} Hub`;
    setStoreName(name);
    setNiche(selectedNiche);

    addLog('market', `Initializing autonomous Store Agent on network: "${name}"`);
    addLog('market', `Niche loaded: "${selectedNiche}". Preparing catalog search from social best-sellers...`);

    try {
      const resp = await fetch('/api/ecommerce/generate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: selectedNiche })
      });
      const generated = await resp.json();
      
      const customProducts: Product[] = generated.map((p: any) => ({
        ...p,
        id: 'prod-' + Date.now() + Math.random().toString(36).substr(2, 4),
        // Convert to Rupees values for financial consistency
        acquisitionCost: Math.round(p.acquisitionCost * 80),
        price: Math.round(p.price * 80 * pricingMultiplier / 3),
        originalPrice: Math.round(p.originalPrice * 80 * pricingMultiplier / 3),
        stock: p.stock || 40,
        sold: 0,
        revenue: 0,
        demandFactor: 1.0
      }));

      setProducts(customProducts);
      setIsStoreSetup(true);
      setSimulatedDay(1);
      setBalance(35000);
      setCampaigns([]);
      setTickets([]);
      setWeeksHistory([]);
      
      const setupLogs: LogEntry[] = [
        { id: 'l1', time: 'Just Now', type: 'market', text: `🤖 Autonomous E-commerce Setup successful for ${name}!` },
        { id: 'l2', time: 'Just Now', type: 'inventory', text: `💡 AI selected products: ${customProducts.map(p => p.name).join(', ')}` },
        { id: 'l3', time: 'Just Now', type: 'pricing', text: `📈 Initial dynamic retail markup set at ${pricingMultiplier}x of buy cost.` }
      ];
      setAgentLogs(setupLogs);
      setAuditResult('');

      saveStoreState(selectedNiche, name, 35000, customProducts, [], [], [], setupLogs, 1, true);
    } catch (e) {
      // Setup default fallback products
      const defaultProds: Product[] = [
        { id: 'p1', name: 'Premium Sustainable Backpack', description: 'Crafted with ocean-bound recycled plastics and waterproof coatings.', category: 'Luggage', acquisitionCost: 1200, price: 3499, originalPrice: 3499, stock: 30, sold: 0, revenue: 0, demandFactor: 1.0 },
        { id: 'p2', name: 'Solar Waterproof Outdoor Light', description: 'Zero energy bills with warm micro-LED smart lights.', category: 'Garden Tech', acquisitionCost: 800, price: 2499, originalPrice: 2499, stock: 40, sold: 0, revenue: 0, demandFactor: 1.0 },
        { id: 'p3', name: 'Zero-Waste Organic Bamboo Bottle', description: 'Keeps beverages cold and supports naturally biodegradable waste cycles.', category: 'Housewares', acquisitionCost: 500, price: 1599, originalPrice: 1599, stock: 50, sold: 0, revenue: 0, demandFactor: 1.0 }
      ];
      setProducts(defaultProds);
      setIsStoreSetup(true);
      setSimulatedDay(1);
      setBalance(35000);
      setCampaigns([]);
      setTickets([]);
      setWeeksHistory([]);
      
      const fallbackLogs: LogEntry[] = [
        { id: 'l1', time: 'Just Now', type: 'market', text: `🤖 Autopilot Setup offline-loaded for ${name}.` },
        { id: 'l2', time: 'Just Now', type: 'inventory', text: `🚨 Product catalogs initialized with safe high-margin local targets.` }
      ];
      setAgentLogs(fallbackLogs);
      saveStoreState(selectedNiche, name, 35000, defaultProds, [], [], [], fallbackLogs, 1, true);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Reset current store state
  const resetStore = () => {
    if (window.confirm("Are you sure you want to shut down this AI-managed store and start fresh? All progress, sales history, and logs will be deleted.")) {
      setIsStoreSetup(false);
      localStorage.removeItem('venturemind_ecommerce_store_v1');
    }
  };

  // 2. Launch Ad Campaign via server-side Gemini
  const createCampaign = async () => {
    if (!selectedProductForAd) {
      alert("Please select a target product to market!");
      return;
    }
    const targetProd = products.find(p => p.id === selectedProductForAd);
    if (!targetProd) return;

    if (balance < adBudget) {
      alert("Insufficient funds to start campaign! Withdraw money or optimize pricing first.");
      return;
    }

    setCampaignLoading(true);
    addLog('marketing', `AI Dispatching Creative Copywriter for: "${targetProd.name}"...`);

    try {
      const resp = await fetch('/api/ecommerce/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: targetProd.name,
          niche,
          channel: adChannel,
          budget: adBudget
        })
      });
      const data = await resp.json();

      const newCampaign: Campaign = {
        id: 'camp-' + Date.now(),
        productName: targetProd.name,
        channel: adChannel,
        budget: adBudget,
        spent: adBudget,
        ctr: data.ctr || 0.025,
        salesCount: 0,
        revenue: 0,
        adCopy: data.adCopy || `💥 Discover our premium ${targetProd.name}! Designed to fit your life perfectly. Save big today!`,
        status: 'active'
      };

      setBalance(prev => prev - adBudget);
      const nextCamps = [newCampaign, ...campaigns];
      setCampaigns(nextCamps);
      addLog('marketing', `📣 Live Ad Campaign launched on ${adChannel}! Spend: ₹${adBudget}. Optimized ad copy generated by Gemini.`);
      
      saveStoreState(niche, storeName, balance - adBudget, products, nextCamps, tickets, weeksHistory, agentLogs, simulatedDay, isStoreSetup);
    } catch (e) {
      addLog('marketing', `⚠️ Ad-network bidding failed. Launched local organic budget Campaign.`);
    } finally {
      setCampaignLoading(false);
    }
  };

  // 3. User customized Support Ticket Submission
  const raiseSupportTicket = async (customMsg?: string, senderName?: string) => {
    const defaultTemplate = SUPPORT_TEMPLATES[Math.floor(Math.random() * SUPPORT_TEMPLATES.length)];
    const textMsg = customMsg || customTicketMsg || defaultTemplate.message;
    const clientName = senderName || customTicketName || defaultTemplate.name;

    setSupportLoading(true);
    addLog('support', `📩 Incoming customer ticket from ${clientName}: "${textMsg.substring(0, 40)}..."`);

    try {
      const response = await fetch('/api/ecommerce/solve-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: clientName,
          message: textMsg,
          orderId: defaultTemplate.orderId,
          productList: products.map(p => p.name)
        })
      });
      const data = await response.json();

      const newTicket: Ticket = {
        id: 'tick-' + Date.now(),
        customerName: clientName,
        email: senderName ? `${senderName.toLowerCase().replace(/\s/g, '')}@gmail.com` : defaultTemplate.email,
        subject: customMsg ? "Customer Custom Enquiry" : defaultTemplate.subject,
        message: textMsg,
        orderId: defaultTemplate.orderId,
        status: 'resolved',
        reply: data.reply,
        actionTaken: data.actionTaken,
        notes: data.notes,
        createdAt: new Date().toLocaleDateString('en-IN')
      };

      // Apply customer service consequences (refunding legally can deduct from budget, replacing reduces a product stock by 1)
      let currentBal = balance;
      let nextProducts = [...products];

      if (data.actionTaken === 'refund') {
        const refundAmt = 1500; // Average refund value for demo
        currentBal = Math.max(0, balance - refundAmt);
        addLog('support', `💸 Client Support refunded client ₹${refundAmt} as requested by regulatory protocols.`);
      } else if (data.actionTaken === 'replace') {
        if (nextProducts.length > 0) {
          nextProducts[0].stock = Math.max(0, nextProducts[0].stock - 1);
          addLog('support', `📦 Support action: Dispatched zero-cost product replacement item for Order ${defaultTemplate.orderId}.`);
        }
      }

      setBalance(currentBal);
      setProducts(nextProducts);
      setTickets(prev => [newTicket, ...prev]);
      addLog('support', `✨ Automated Support Robot replied to ${clientName}: resolved via legal decision: [${data.actionTaken?.toUpperCase()}].`);
      
      setCustomTicketMsg('');
      setCustomTicketName('');

      saveStoreState(niche, storeName, currentBal, nextProducts, campaigns, [newTicket, ...tickets], weeksHistory, agentLogs, simulatedDay, isStoreSetup);
    } catch (e) {
      addLog('support', `❌ Ticket API rate limited. Manually solved customer ticket: "General Information Sent".`);
    } finally {
      setSupportLoading(false);
    }
  };

  // 4. Autonomous Agent Step Sweeper Loop (Autopilot core loop)
  const runAutopilotAdvance = () => {
    // Progress days
    const nextDay = simulatedDay + 1;
    setSimulatedDay(nextDay);
    
    // Simulate campaign traffic conversions
    let salesToday = 0;
    let revToday = 0;
    let costOfGoodsSold = 0;

    // Mutate and update active products
    const updatedProducts = products.map(prod => {
      let dailySales = 0;
      
      // Calculate active base demand
      const baseConversionOdds = 0.05 + (prod.demandFactor - 1) * 0.1;
      
      // Check if campaigns are promoting this product
      const matchingCamps = campaigns.filter(c => c.productName === prod.name && c.status === 'active');
      let campaignConversionBoost = 0;
      matchingCamps.forEach(camp => {
        // High budget + high CTR brings massive organic sales boost!
        campaignConversionBoost += Math.round(camp.budget * camp.ctr * (0.8 + Math.random() * 0.4));
      });

      // Daily natural organic traffic + marketing conversion
      dailySales = Math.floor(Math.random() * 3) + Math.min(prod.stock, Math.round(campaignConversionBoost));
      
      // Cap at safe actual stock levels
      dailySales = Math.min(prod.stock, dailySales);
      
      const salesWorth = dailySales * prod.price;
      const wholesaleExpenditure = dailySales * prod.acquisitionCost;

      salesToday += dailySales;
      revToday += salesWorth;
      costOfGoodsSold += wholesaleExpenditure;

      return {
        ...prod,
        stock: prod.stock - dailySales,
        sold: prod.sold + dailySales,
        revenue: prod.revenue + salesWorth
      };
    });

    // Handle Active Campaign stats mutations
    const updatedCampaigns = campaigns.map(camp => {
      if (camp.status === 'active') {
        const conversionOdds = camp.ctr;
        const totalSalesFromCamp = Math.round(camp.budget * conversionOdds * (1 + Math.random() * 0.3));
        const correspondingProd = products.find(p => p.name === camp.productName);
        const revenueEarned = correspondingProd ? totalSalesFromCamp * correspondingProd.price : 0;
        
        return {
          ...camp,
          salesCount: camp.salesCount + totalSalesFromCamp,
          revenue: camp.revenue + revenueEarned,
          status: 'completed' as const // completed as campaigns run in active budget bursts
        };
      }
      return camp;
    });

    // Auto restocking check (Inventory Manager Sweep)
    let totalRestockCosts = 0;
    const finalizedProducts = updatedProducts.map(prod => {
      if (prod.stock < 10) {
        const unitsToBuy = 30;
        const totalCost = unitsToBuy * prod.acquisitionCost;
        if (balance + revToday - costOfGoodsSold > totalCost) {
          totalRestockCosts += totalCost;
          addLog('inventory', `🤖 [Auto-Stock Alert] "${prod.name}" level is low (${prod.stock} units left). Buying wholesale restocking parcel of 30 units for ₹${totalCost}.`);
          return {
            ...prod,
            stock: prod.stock + unitsToBuy
          };
        } else {
          addLog('inventory', `⚠️ [Restock Warning] Critical stock low for "${prod.name}", but cash balance is too low to order high-margin bundles.`);
        }
      }
      return prod;
    });

    // Multiplier Pricing Optimization (Dynamic pricing sweep)
    const fullyOptimizedProducts = finalizedProducts.map(prod => {
      let optimalPrice = prod.price;
      const salesRatio = prod.sold / (prod.stock + prod.sold || 1);
      
      if (salesRatio > 0.4) {
        // High demand, boost price by 5-10% to secure higher margins
        optimalPrice = Math.round(prod.price * 1.08);
        addLog('pricing', `📈 Dynamic pricing: Demand for "${prod.name}" is high. Optimized retail listing to ₹${optimalPrice} to maximize margins.`);
      } else if (salesRatio < 0.1 && prod.stock > 30) {
        // Slow sales, lower price slightly to clear inventory
        optimalPrice = Math.max(Math.round(prod.acquisitionCost * 1.6), Math.round(prod.price * 0.9));
        addLog('pricing', `📉 Dynamic pricing: Slow sales for "${prod.name}". AI adjusted price to promotional marker ₹${optimalPrice} (-10%) to shift volume.`);
      }

      return {
        ...prod,
        price: optimalPrice
      };
    });

    // Update net ledger balance
    const netCashFlowChange = revToday - totalRestockCosts;
    const nextBalance = balance + netCashFlowChange;

    setProducts(fullyOptimizedProducts);
    setCampaigns(updatedCampaigns);
    setBalance(nextBalance);

    addLog('finance', `☀️ Day ${nextDay} Complete. Daily Sales: ${salesToday} units, revenue earned: ₹${revToday}. Net Cashflow change: ₹${netCashFlowChange}`);

    // Every 7 simulated days are summarized as one "Weekly Financial Report"
    if (nextDay % 7 === 1 && nextDay > 1) {
      const activeWeekNumber = Math.floor((nextDay - 1) / 7);
      
      // Calculate values for report from ledger metrics
      const advertisingOutlay = campaigns.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.budget, 0);
      const hostFees = 450; // simulated webhosting / domain SSL legal costs
      const totalSupportOverhead = tickets.length * 200; // customer support processing fees in ₹
      
      const weeklyRevenue = revToday * 7; // Average weekly projection based on last cycle
      const weeklyRestocks = totalRestockCosts + costOfGoodsSold;
      const netProfit = weeklyRevenue - weeklyRestocks - advertisingOutlay - hostFees - totalSupportOverhead;
      const profitMarginTotal = weeklyRevenue > 0 ? Math.round((netProfit / weeklyRevenue) * 100) : 0;

      const newReport: FinancialWeek = {
        weekNumber: activeWeekNumber,
        grossSales: Math.round(weeklyRevenue),
        inventoryCosts: Math.round(weeklyRestocks),
        marketingSpend: Math.round(advertisingOutlay),
        supportOverhead: Math.round(totalSupportOverhead),
        hostingFees: hostFees,
        netProfit: Math.round(netProfit),
        profitMargin: Math.round(profitMarginTotal)
      };

      setWeeksHistory(prev => [newReport, ...prev]);
      addLog('finance', `📊 [Ledger Milestone] Compiling Weekly Financial Report #${activeWeekNumber}! Net Margin recorded at ${profitMarginTotal}%`);
      
      saveStoreState(niche, storeName, nextBalance, fullyOptimizedProducts, updatedCampaigns, tickets, [newReport, ...weeksHistory], agentLogs, nextDay, isStoreSetup);
    } else {
      saveStoreState(niche, storeName, nextBalance, fullyOptimizedProducts, updatedCampaigns, tickets, weeksHistory, agentLogs, nextDay, isStoreSetup);
    }
  };

  // Perform a manual quick run sweep of the store agent
  const triggerManualAgentSweep = () => {
    runAutopilotAdvance();
  };

  // Active automation loop timer
  useEffect(() => {
    let interval: any = null;
    if (isAutopilotRunning && isStoreSetup) {
      interval = setInterval(() => {
        runAutopilotAdvance();
      }, 10000); // Trigger autonomous day progression & operations every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isAutopilotRunning, isStoreSetup, products, campaigns, balance, simulatedDay, weeksHistory]);

  // 5. Request a deep CFO financial Audit via Gemini
  const generateCfoAudit = async () => {
    setAuditLoading(true);
    try {
      const resp = await fetch('/api/ecommerce/financial-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: weeksHistory,
          currentBalance: balance,
          niche,
          productsList: products.map(p => ({
            name: p.name,
            cost: p.acquisitionCost,
            price: p.price,
            stock: p.stock,
            sold: p.sold,
            revenue: p.revenue
          }))
        })
      });
      const data = await resp.json();
      setAuditResult(data.audit);
      addLog('finance', `🛡️ Custom CFO Smart Financial audit generated by Gemini.`);
    } catch (e) {
      setAuditResult(`### Audit Failure\nGemini CFO advisor encountered an error auditing your store database. Please verify backend networks and try again.`);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-[2rem] overflow-hidden">
      
      {/* 1. Header with Autopilot Store Metadata */}
      <div className="p-6 md:p-8 border-b border-[#e5e5e0] bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative background grid element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6321] opacity-10 blur-[130px] -mr-32 -mt-32" />
        
        <div className="z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#FF6321]/15 border border-[#FF6321]/30 rounded-2xl flex items-center justify-center text-[#FF6321] animate-pulse">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg md:text-xl tracking-tight leading-none">{isStoreSetup ? storeName : "Launch AI E-Store"}</h3>
              {isStoreSetup && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isAutopilotRunning ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isAutopilotRunning ? '● Autopilot Active' : '● Paused'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-medium select-none">Autonomous E-Commerce Store & Automated CFO Ledger</p>
          </div>
        </div>

        {/* Global balance & autonomous controls */}
        {isStoreSetup && (
          <div className="z-10 flex items-center gap-3 self-stretch md:self-auto">
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 flex flex-col justify-center min-w-[120px]">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Wallet Ledger</span>
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono">₹{balance.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setIsAutopilotRunning(prev => !prev)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                  ${isAutopilotRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                    : 'bg-[#FF6321] hover:bg-[#ff753b] text-white'}`}
              >
                {isAutopilotRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                {isAutopilotRunning ? "Pause AI" : "Start AI"}
              </button>
              
              <button
                onClick={triggerManualAgentSweep}
                className="px-4 py-1.5 bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                title="Force AI Autopilot Cycle"
              >
                <RefreshCw className="w-3 h-3 animate-spin duration-3000" /> Cycle Day
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. ONBOARDING & SETUP STATE (If no store loaded) */}
      {!isStoreSetup && (
        <div className="p-8 md:p-12 text-center space-y-8 max-w-2xl mx-auto py-16">
          <div className="w-16 h-16 bg-[#f5f5f4] rounded-3xl flex items-center justify-center mx-auto text-[#FF6321]">
            <Plus className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <h4 className="text-2xl font-bold tracking-tight">Configure E-Commerce Autopilot</h4>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-lg mx-auto">
              Command the VentureMind AI Agent to discover profitable items, buy wholesale stock inventory, dynamically update prices based on market scans, execute automated ad-marketing promos, and respond legally to consumers over compliance channels.
            </p>
          </div>

          <div className="bg-[#fafafa] border border-[#e5e5e0] rounded-3xl p-6 text-left space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Select Market Niche Campaign</label>
              <div className="grid grid-cols-2 gap-3">
                {['Eco-Friendly Goods', 'Smart Tech Gadgets', 'Sustainable Living', 'Minimalist Apparel'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className={`p-4 rounded-2xl border text-left text-sm font-bold transition-all cursor-pointer
                      ${niche === n 
                        ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                        : 'bg-white text-neutral-700 border-[#e5e5e0] hover:border-black'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Price Mark-Up Margin (AI Guide)</label>
                <select
                  value={pricingMultiplier}
                  onChange={(e) => setPricingMultiplier(parseFloat(e.target.value))}
                  className="w-full bg-white border border-[#e5e5e0] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-black"
                >
                  <option value={2.0}>2.0x Markup (Moderate Margin)</option>
                  <option value={3.0}>3.0x Markup (Optimal Balance)</option>
                  <option value={4.0}>4.0x Markup (Aggressive Profitability)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Startup Capital Investment</label>
                <div className="px-4 py-3 bg-neutral-100 border border-[#e5e5e0] rounded-xl text-neutral-600 text-xs font-mono font-bold">
                  ₹35,000 (Allocated safely)
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => initializeStore(niche)}
            disabled={discoveryLoading}
            className="w-full md:w-auto px-10 py-4 bg-[#FF6321] text-white rounded-2xl font-bold text-sm tracking-tight hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-[#FF6321]/10"
          >
            {discoveryLoading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Fetching market trends & stocking shop...</>
            ) : (
              <><Sparkles className="w-4 h-4 fill-white" /> Spawn & Initialise Store</>
            )}
          </button>
        </div>
      )}

      {/* 3. STORE LOADED - CORE TABBED EXPERIENCE */}
      {isStoreSetup && (
        <div className="flex flex-col min-h-[500px]">
          {/* Sub Navigation Bar */}
          <div className="bg-[#fafafa] border-b border-[#e5e5e0] flex overflow-x-auto select-none">
            {[
              { id: 'monitor', label: 'Monitor Desk', icon: <Bot className="w-4 h-4" /> },
              { id: 'catalog', label: 'Product Catalog', icon: <Package className="w-4 h-4" /> },
              { id: 'marketing', label: 'Marketing PR', icon: <Megaphone className="w-4 h-4" /> },
              { id: 'support', label: 'Support Desk', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'reports', label: 'weekly statistics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-6 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-colors
                    ${isActive 
                      ? 'border-[#FF6321] text-black font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sub Panels Container */}
          <div className="p-6 md:p-8 flex-1">
            <AnimatePresence mode="wait">
              
              {/* monitor tab */}
              {activeTab === 'monitor' && (
                <motion.div 
                  key="monitor" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-[#e5e5e0]">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Simulated Day</span>
                      <p className="text-2xl font-bold mt-1">Day {simulatedDay}</p>
                      <span className="text-[10px] text-neutral-400">Ledger cycle resets every 7 days</span>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-[#e5e5e0]">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Active Catalog</span>
                      <p className="text-2xl font-bold mt-1">{products.length} Items</p>
                      <span className="text-[10px] text-green-600 font-bold">100% stocked catalog</span>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-[#e5e5e0]">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Ads Promoted</span>
                      <p className="text-2xl font-bold mt-1">{campaigns.length} Campaigns</p>
                      <span className="text-[10px] text-neutral-400">Marketing on social channels</span>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-[#e5e5e0]">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Tickets Solved</span>
                      <p className="text-2xl font-bold mt-1">{tickets.length} Solved</p>
                      <span className="text-[10px] text-green-600 font-bold">0 outstanding tickets</span>
                    </div>
                  </div>

                  {/* Core layout: Live Logs and Quick Actions Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live console logs */}
                    <div className="lg:col-span-2 bg-neutral-950 text-neutral-200 rounded-3xl p-6 font-mono text-xs border border-neutral-800 flex flex-col h-[320px]">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-bold text-[10px] tracking-wider uppercase text-neutral-400">Live Agent Autopilot logs</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-bold">Auto-cycle triggers every 10s</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                        {agentLogs.map((log) => {
                          let typeColor = 'text-[#FF6321]';
                          if (log.type === 'inventory') typeColor = 'text-green-400';
                          if (log.type === 'pricing') typeColor = 'text-blue-400';
                          if (log.type === 'support') typeColor = 'text-purple-400';
                          if (log.type === 'finance') typeColor = 'text-amber-400';

                          return (
                            <div key={log.id} className="leading-relaxed">
                              <span className="text-neutral-500 mr-2">[{log.time}]</span>
                              <span className={`${typeColor} font-bold mr-1.5`}>[{log.type.toUpperCase()}]</span>
                              <span>{log.text}</span>
                            </div>
                          );
                        })}
                        <div ref={logsEndRef} />
                      </div>
                    </div>

                    {/* Quick Simulation Interventions */}
                    <div className="bg-neutral-50 p-6 rounded-3xl border border-[#e5e5e0] space-y-6">
                      <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#FF6321]" /> Operator Interventions
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Trigger Simulation events</span>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => {
                                const names = ["Amit Trivedi", "Priya Nair", "Nitin Vyas"];
                                const customMsg = "Hi, can you verify the compliance certificate and warranty card for this product standard?";
                                raiseSupportTicket(customMsg, names[Math.floor(Math.random()*names.length)]);
                              }}
                              disabled={supportLoading}
                              className="w-full text-left py-2 px-3 hover:bg-neutral-200/50 rounded-xl text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <span>📩 Mock Compliance inquiry</span>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                // Add random sudden organic high sales event
                                setProducts(prev => prev.map((p, i) => i === 0 ? {
                                  ...p, 
                                  stock: Math.max(0, p.stock - 5), 
                                  sold: p.sold + 5, 
                                  revenue: p.revenue + (5 * p.price)
                                } : p));
                                setBalance(prev => prev + (5 * products[0].price));
                                addLog('finance', `🔥 [Traffic Surge] Sudden viral social trend spikes! Instant 5 item sales generated for "${products[0].name}"! Wallet credited.`);
                              }}
                              className="w-full text-left py-2 px-3 hover:bg-neutral-200/50 rounded-xl text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <span>🔥 Run Viral Social Surge (+5 sales)</span>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-4 text-center">
                          <button
                            onClick={resetStore}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                          >
                            Shutdown AI Store Fresh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* catalog tab */}
              {activeTab === 'catalog' && (
                <motion.div 
                  key="catalog" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base md:text-lg">Dynamic Inventory Hub</h4>
                      <p className="text-xs text-neutral-500">Autonomous dynamic margins adjusted automatically according to consumer market demand.</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = products.map(p => ({
                          ...p,
                          stock: p.stock + 10
                        }));
                        const wholesaleCost = products.reduce((sum, p) => sum + (10 * p.acquisitionCost), 0);
                        if (balance < wholesaleCost) {
                          alert("Insufficient capitals to manually restock whole inventory!");
                          return;
                        }
                        setBalance(prev => prev - wholesaleCost);
                        setProducts(updated);
                        addLog('inventory', `📦 Manual operational restock: Replenished 10 units for all catalog items. Wholesales cost: ₹${wholesaleCost}`);
                      }}
                      className="px-4 py-2 bg-black text-white hover:scale-105 rounded-xl text-xs font-bold transition-transform cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Buy Wholesale Restock (+10 units each)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map((p) => {
                      const profitPerUnit = p.price - p.acquisitionCost;
                      const returnOnInvestment = Math.round((profitPerUnit / p.acquisitionCost) * 100);

                      return (
                        <div key={p.id} className="bg-white border border-[#e5e5e0] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-black transition-colors">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-mono">{p.category}</span>
                              <span className={`text-[10px] px-2.5 py-0.5 font-bold rounded-full ${p.stock < 15 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                Stock: {p.stock} units
                              </span>
                            </div>
                            <h5 className="font-bold text-base leading-snug">{p.name}</h5>
                            <p className="text-xs text-neutral-500 leading-relaxed">{p.description}</p>
                          </div>

                          <div className="border-t border-[#e5e5e0]/70 pt-4 mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Wholesale Buy Cost</span>
                                <span className="text-sm font-bold font-mono">₹{p.acquisitionCost}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#FF6321] block font-bold uppercase">AI Retail Price</span>
                                <span className="text-sm font-bold font-mono text-[#FF6321] flex items-center gap-1">
                                  ₹{p.price}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">ROI Profit %</span>
                                <span className="text-sm font-bold text-green-600 font-mono">+{returnOnInvestment}%</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Sold Volume</span>
                                <span className="text-sm font-bold font-mono">{p.sold} orders</span>
                              </div>
                            </div>

                            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-neutral-500">Item Cumulative Earnings:</span>
                              <span className="font-mono font-bold text-black">₹{p.revenue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* marketing tab */}
              {activeTab === 'marketing' && (
                <motion.div 
                  key="marketing" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Launch New Ads Panel */}
                    <div className="bg-neutral-50 border border-[#e5e5e0] rounded-3xl p-6 md:p-8 space-y-6 h-fit">
                      <div>
                        <h4 className="font-bold text-lg">Marketing Operations</h4>
                        <p className="text-xs text-neutral-500">Initiate dynamic marketing campaigns. Custom AI-generated hooks and direct target CTR profiles will scale sales overnight.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Selected Inventory Focus</label>
                          <select
                            value={selectedProductForAd}
                            onChange={(e) => setSelectedProductForAd(e.target.value)}
                            className="w-full bg-white border border-[#e5e5e0] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black font-semibold"
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} units)</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Channel Network</label>
                            <select
                              value={adChannel}
                              onChange={(e) => setAdChannel(e.target.value)}
                              className="w-full bg-white border border-[#e5e5e0] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                            >
                              <option value="Instagram">Instagram</option>
                              <option value="TikTok">TikTok Ads</option>
                              <option value="Google Search">Google Ads</option>
                              <option value="Facebook Marketplace">Facebook</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Operational Budget</label>
                            <select
                              value={adBudget}
                              onChange={(e) => setAdBudget(parseInt(e.target.value))}
                              className="w-full bg-white border border-[#e5e5e0] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                            >
                              <option value={1500}>₹1,500 (Lean Promo)</option>
                              <option value={3000}>₹3,000 (Local Launch)</option>
                              <option value={6000}>₹6,000 (High-Budget Blitz)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={createCampaign}
                          disabled={campaignLoading || !selectedProductForAd}
                          className="w-full py-3.5 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {campaignLoading ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching smart ad copy...</>
                          ) : (
                            <><Megaphone className="w-4 h-4" /> Deploy Marketing Campaign</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Active/Completed Campaigns Tracker */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex justify-between items-end border-b border-[#e5e5e0] pb-3">
                        <h4 className="font-bold text-sm uppercase tracking-wide text-neutral-400">Campaigns Performance Tracking</h4>
                        <span className="text-xs font-semibold text-neutral-500">Autonomous scaling metrics</span>
                      </div>

                      <div className="space-y-4">
                        {campaigns.length > 0 ? campaigns.map((camp) => (
                          <div key={camp.id} className="bg-white border border-[#e5e5e0] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-[#e5e5e0] pb-3 mb-3">
                              <div>
                                <h5 className="font-bold text-sm text-[#FF6321]">{camp.productName}</h5>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Marketing Channel: <span className="font-bold text-neutral-700">{camp.channel}</span></p>
                              </div>
                              <span className={`text-[10px] px-2.5 py-0.5 font-bold rounded-full uppercase ${camp.status === 'completed' ? 'bg-neutral-100 text-neutral-600' : 'bg-green-50 text-green-600 animate-pulse'}`}>
                                {camp.status === 'completed' ? 'Completed Burst' : '⚡ Bidding Active'}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic leading-relaxed mb-4">
                              "{camp.adCopy}"
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Budget Invested</span>
                                <span className="font-bold font-mono">₹{camp.budget}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Target CTR %</span>
                                <span className="font-bold text-blue-500 font-mono">{(camp.ctr * 100).toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Acquired Sales</span>
                                <span className="font-bold text-green-600 font-mono">+{camp.salesCount} conversions</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Return Sales</span>
                                <span className="font-bold text-black font-mono">₹{camp.revenue.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center bg-neutral-50 border border-dashed border-[#e5e5e0] rounded-3xl text-neutral-400">
                            <Megaphone className="w-8 h-8 mx-auto opacity-30 mb-2" />
                            <p className="text-xs font-semibold">No campaigns launched yet. Start marketing some products!</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* support tab */}
              {activeTab === 'support' && (
                <motion.div 
                  key="support" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* User Injected Support Form */}
                    <div className="bg-neutral-50 border border-[#e5e5e0] rounded-3xl p-6 md:p-8 space-y-6 h-fit">
                      <div>
                        <h4 className="font-bold text-lg">Live Support Desk</h4>
                        <p className="text-xs text-neutral-500">Inject customized ticket requests. The support AI agent analyzes customer queries and applies refund or replacement codes based on standard rules.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Simulation Customer Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Priyesh Patel"
                            value={customTicketName}
                            onChange={(e) => setCustomTicketName(e.target.value)}
                            className="w-full bg-white border border-[#e5e5e0] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Customer Message / Inquiry Prompt</label>
                          <textarea
                            rows={3}
                            placeholder="Type complaint... e.g., 'The item arrived cracked and damaged. Grant me a refund!'"
                            value={customTicketMsg}
                            onChange={(e) => setCustomTicketMsg(e.target.value)}
                            className="w-full bg-white border border-[#e5e5e0] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-black"
                          />
                        </div>

                        <button
                          onClick={() => raiseSupportTicket()}
                          disabled={supportLoading || !customTicketMsg.trim()}
                          className="w-full py-3.5 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {supportLoading ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Solving under compliance rules...</>
                          ) : (
                            <><Send className="w-4 h-4" /> Send Ticket to AI Agent</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Support Tickets Console Log */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex justify-between items-end border-b border-[#e5e5e0] pb-3">
                        <h4 className="font-bold text-sm uppercase tracking-wide text-neutral-400">Processed Support Inboxes</h4>
                        <span className="text-xs font-semibold text-neutral-500">Real-time status checking</span>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {tickets.length > 0 ? tickets.map((t) => (
                          <div key={t.id} className="bg-white border border-[#e5e5e0] rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#e5e5e0] pb-2.5">
                              <div>
                                <h5 className="font-bold text-sm text-black">{t.customerName}</h5>
                                <p className="text-[10px] text-neutral-400">{t.email} • Order {t.orderId}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-200 uppercase">
                                Action: {t.actionTaken?.toUpperCase() || 'RESOLVED'}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-bold text-[10px] text-neutral-400 block uppercase">Client Message</span>
                                <p className="text-neutral-600">{t.message}</p>
                              </div>
                              
                              {t.reply && (
                                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                  <span className="font-bold text-[10px] text-neutral-400 block uppercase">AI Agent Auto-Resolution Output</span>
                                  <p className="text-neutral-700 italic">"{t.reply}"</p>
                                  {t.notes && (
                                    <p className="text-[9px] text-[#FF6321] font-bold mt-1.5 uppercase tracking-wide">💼 Supervisor Node: {t.notes}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center bg-neutral-50 border border-dashed border-[#e5e5e0] rounded-3xl text-neutral-400">
                            <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
                            <p className="text-xs font-semibold">No tickets solved yet. Inject or wait for auto-scans.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* reports tab */}
              {activeTab === 'reports' && (
                <motion.div 
                  key="reports" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg">CFO Ledger Archives</h4>
                      <p className="text-xs text-neutral-500">Weekly financial statements, regulatory cost structures, and real-time smart audits.</p>
                    </div>
                    
                    <button
                      onClick={generateCfoAudit}
                      disabled={auditLoading || weeksHistory.length === 0}
                      className="px-5 py-3 bg-[#FF6321] text-white hover:scale-105 disabled:opacity-50 transition-transform rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {auditLoading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing stats with Gemini...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 fill-white" /> Request Gemini CFO Smart Audit</>
                      )}
                    </button>
                  </div>

                  {/* Smart Audit outcome container */}
                  {auditResult && (
                    <div className="bg-neutral-50 border border-[#e5e5e0] rounded-3xl p-6 md:p-8 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#e5e5e0]">
                        <Bot className="w-5 h-5 text-[#FF6321]" />
                        <h5 className="font-bold text-sm tracking-tight">Gemini Executive CFO Advice Letter</h5>
                      </div>
                      <div className="text-xs md:text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                        {auditResult}
                      </div>
                    </div>
                  )}

                  {/* Table layout of weekly financial performance reports */}
                  <div className="bg-white border border-[#e5e5e0] rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-900 text-white font-bold uppercase tracking-wider">
                            <th className="p-4">Report Segment</th>
                            <th className="p-4">Gross Sales Revenue</th>
                            <th className="p-4">Inventory Restock Costs</th>
                            <th className="p-4">Marketing Promotions</th>
                            <th className="p-4">Regulatory Support Desk</th>
                            <th className="p-4">SSL & Secure Hosting</th>
                            <th className="p-4">Net Profit</th>
                            <th className="p-4">Profit Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e0]">
                          {weeksHistory.length > 0 ? weeksHistory.map((week) => (
                            <tr key={week.weekNumber} className="hover:bg-neutral-50 transition-colors">
                              <td className="p-4 font-bold text-black">Week #{week.weekNumber} Report</td>
                              <td className="p-4 font-mono font-semibold text-green-600">₹{week.grossSales.toLocaleString('en-IN')}</td>
                              <td className="p-4 font-mono text-neutral-500">₹{week.inventoryCosts.toLocaleString('en-IN')}</td>
                              <td className="p-4 font-mono text-neutral-500">₹{week.marketingSpend.toLocaleString('en-IN')}</td>
                              <td className="p-4 font-mono text-neutral-500">₹{week.supportOverhead.toLocaleString('en-IN')}</td>
                              <td className="p-4 font-mono text-neutral-400">₹{week.hostingFees}</td>
                              <td className={`p-4 font-mono font-bold ${week.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                ₹{week.netProfit.toLocaleString('en-IN')}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold ${week.profitMargin >= 25 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {week.profitMargin}%
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-neutral-400 font-medium">
                                No weekly ledger statements compiled yet. Day simulated counts must reach Day 7 to initiate statements.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
}
