import React, { useState } from 'react';
import { 
  Download, Globe, Smartphone, DollarSign, ExternalLink, 
  ShieldCheck, Rocket, ChevronRight, X, Terminal, CheckCircle2, Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImplementationDetail {
  title: string;
  subtitle: string;
  badge: string;
  commands: string[];
  checklist: string[];
  tips: string[];
}

export function DeploymentGuide() {
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const steps = [
    {
      title: "Step 1: Export Source",
      desc: "Use the AI Studio Settings menu to 'Download ZIP' or 'Export to GitHub'. This secures your ownership of the code.",
      icon: <Download className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Step 2: Web Hosting",
      desc: "Deploy to platforms like Vercel or Netlify for a public URL. This is your 'Web Presence' for users.",
      icon: <Globe className="w-6 h-6" />,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Step 3: Mobile Wrapper",
      desc: "Use 'Capacitor' by Ionic to turn this React code into an Android (APK/AAB) bundle suitable for the Play Store.",
      icon: <Smartphone className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Step 4: Play Store Listing",
      desc: "Submit your AAB file to Google Play Console. Use AI-generated descriptions to boost your app's SEO.",
      icon: <Rocket className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-600"
    }
  ];

  const implementationDetails: Record<number, ImplementationDetail> = {
    0: {
      title: "Exporting Code & Setup",
      subtitle: "Securing full code sovereignty for local execution",
      badge: "Local Workstation",
      commands: [
        "npm install",
        "npm run dev"
      ],
      checklist: [
        "Clone the exported GitHub repository or extract the ZIP container.",
        "Ensure Node.js 18+ and npm are set up on your machine.",
        "Create a local `.env` file in the project root.",
        "Populate `GEMINI_API_KEY` to run the business brain module locally."
      ],
      tips: [
        "Never commit `.env` files to public GitHub repositories.",
        "Use `nvm use 18` or `nvm use 20` to verify Node.js runtimes match."
      ]
    },
    1: {
      title: "Vercel & Netlify Deployment",
      subtitle: "Launching the live full-stack web application endpoint",
      badge: "Production Web Host",
      commands: [
        "npm install -g vercel",
        "vercel login",
        "vercel --prod"
      ],
      checklist: [
        "Set the project Framework Preset in Vercel to 'Vite'.",
        "Configure Build Command to: `npm run build`.",
        "Set Output Directory configuration to: `dist/`.",
        "Paste the database config and API securely inside your host panel's Environment Variables."
      ],
      tips: [
        "Vercel auto-configures SSL credentials and assigns an https domain name instantly.",
        "Connect your custom domain (e.g. venturemind.ai) via Vercel's DNS management."
      ]
    },
    2: {
      title: "Capacitor Mobile Native Wrapper",
      subtitle: "Compiling code to clean Android & iOS Native container projects",
      badge: "Mobile SDK layer",
      commands: [
        "npm install @capacitor/core @capacitor/cli",
        "npx cap init \"VentureMind AI\" \"com.venturemind.app\" --web-dir=dist",
        "npm install @capacitor/android",
        "npx cap add android",
        "npm run build && npx cap sync android",
        "npx cap open android"
      ],
      checklist: [
        "Build the absolute latest production bundle using `npm run build`.",
        "Sync resources (launcher assets, icons) into Capacitor native folders.",
        "Confirm Gradle build scripts in Android Studio point to valid bundle targets.",
        "Generate a Signed Release Android Bundle (AAB format) for Google Play uploads."
      ],
      tips: [
        "Use Android Studio compile systems to review app crash reports.",
        "Ensure your Capacitor config contains accurate Android permissions for network/push notifications."
      ]
    },
    3: {
      title: "Google Play Store Publishing",
      subtitle: "Official release pipeline on the Google Play Console",
      badge: "App Distribution",
      commands: [
        "# Keytool to create dynamic upload keys for release builds",
        "keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
      ],
      checklist: [
        "Register for a Google Play Developer account ($25 lifetime subscription).",
        "Build a beautiful set of mobile screen previews (16:9 vertical format).",
        "Host an official Privacy Policy document link (you can publish this on Vercel).",
        "Enter relevant target demographics, content ratings, and payout details."
      ],
      tips: [
        "Write copy for listing metadata optimized for high search volume terms like 'AI incubators', 'startup strategy', and 'passive business plans'.",
        "Start on Internal Testing Tracks to ensure zero startup glitches on active devices."
      ]
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 1500);
  };

  const activeDetail = activeStepIdx !== null ? implementationDetails[activeStepIdx] : null;

  return (
    <div className="space-y-12">
      <header className="max-w-2xl">
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-[#1a1a1a]">Official Publication Roadmap</h2>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Follow these steps to transition from this incubator to a live, profit-generating mobile application on the Google Play Store.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white border border-[#e5e5e0] rounded-[2rem] hover:border-black transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${step.color}`}>
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">{step.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              {step.desc}
            </p>
            <button 
              onClick={() => setActiveStepIdx(i)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FF6321] group-hover:gap-3 transition-all cursor-pointer"
            >
              Learn Technical Implementation <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="p-10 bg-black rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <DollarSign className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-[#FF6321] mb-4">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Monetization Alpha</span>
          </div>
          <h3 className="text-3xl font-bold mb-6 italic font-serif">"The App is the Engine, Your Ventures are the Fuel."</h3>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6321] mt-2 flex-shrink-0" />
              <p className="text-sm opacity-70">Integrate <strong>Stripe</strong> for premium business consultation subscriptions.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6321] mt-2 flex-shrink-0" />
              <p className="text-sm opacity-70">Use <strong>Google AdMob</strong> in the mobile wrapper to earn via ad impressions.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6321] mt-2 flex-shrink-0" />
              <p className="text-sm opacity-70">Connect <strong>FamPay Business API</strong> to automate vendor payouts directly from the app.</p>
            </li>
          </ul>
          <a 
            href="https://capacitorjs.com/docs/getting-started" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6321] rounded-2xl font-bold text-sm hover:scale-105 transition-transform"
          >
            Capacitor Documentation <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-12 py-12 border-t border-[#e5e5e0] grayscale opacity-40 animate-pulse">
        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
      </div>

      {/* Interactive Modal */}
      <AnimatePresence>
        {activeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStepIdx(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 right-0 p-8">
                <button 
                  onClick={() => setActiveStepIdx(null)}
                  className="p-3 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-[#FF6321]/10 text-[#FF6321] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                  {activeDetail.badge}
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-[#1a1a1a] mb-2">
                  {activeDetail.title}
                </h3>
                <p className="text-neutral-500 text-sm font-medium">
                  {activeDetail.subtitle}
                </p>
              </div>

              {/* Commands Section */}
              {activeDetail.commands.length > 0 && (
                <div className="mb-8 space-y-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Terminal className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Recommended Commands</span>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-2xl p-6 font-mono text-xs text-white relative space-y-2">
                    {activeDetail.commands.map((cmd, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4 py-1 border-b border-neutral-800 last:border-0">
                        <span className="text-green-400 selection:bg-neutral-700 select-all">{cmd}</span>
                        <button 
                          onClick={() => handleCopy(cmd)}
                          className="text-neutral-500 hover:text-white transition-colors p-1"
                        >
                          {copiedText === cmd ? (
                            <span className="text-[10px] text-green-400 font-sans font-bold">Copied!</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              <div className="mb-8 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Complete Checklist</p>
                <div className="space-y-3">
                  {activeDetail.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-neutral-50 rounded-md border border-neutral-200 mt-0.5 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Tips */}
              <div className="p-6 bg-[#f9f9f8] border border-[#e5e5e0] rounded-2xl">
                <div className="flex items-center gap-1.5 mb-2 text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pro Startup Tips</span>
                </div>
                <div className="space-y-2">
                  {activeDetail.tips.map((tip, idx) => (
                    <p key={idx} className="text-xs text-neutral-500 font-medium leading-relaxed">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
