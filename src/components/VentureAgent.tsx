import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, Loader2, Plus, Trash2, Edit2, 
  Search, History, Check, X, FileText, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

const SUGGESTIONS = [
  {
    title: "💡 Find Startup Ideas",
    desc: "Generate 3 highly profitable lean business ideas for a solo founder.",
    prompt: "Generate 3 low-cost, high-margin business ideas that I can start immediately with minimal capital to make money."
  },
  {
    title: "📋 Create Action Plan",
    desc: "Get a step-by-step roadmap, launch checklist, and first-week goals.",
    prompt: "I want to start a lean startup. Detail a complete launch checklist, MVP outline, and step-by-step action plan to win my first paying clients."
  },
  {
    title: "💵 Monetization Plan",
    desc: "Outline revenue channels, subscription tiers, or ad placements.",
    prompt: "How can I monetize my business idea quickly? Suggest key revenue streams and how to configure payouts to earn real income."
  }
];

export function VentureAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your VentureMind AI Agent. What kind of business are we building today? I can help you discover a profitable idea, layout an action plan roadmap, and set up your direct payouts." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // New multi-session state managers
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile slider toggle
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user and load historical chat logs
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        const stored = localStorage.getItem(`venturemind_sessions_${user.uid}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setSessions(parsed);
            if (parsed.length > 0) {
              setActiveSessionId(parsed[0].id);
              setMessages(parsed[0].messages);
            } else {
              initializeDefaultSession(user.uid);
            }
          } catch (e) {
            console.error("Error parsing stored sessions", e);
            initializeDefaultSession(user.uid);
          }
        } else {
          initializeDefaultSession(user.uid);
        }
      } else {
        setUserId(null);
        setSessions([]);
        setActiveSessionId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update autoscroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const initializeDefaultSession = (uid: string) => {
    const defaultSession: ChatSession = {
      id: 'def-' + Date.now(),
      title: "Launch Brainstorm",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        { role: 'bot', content: "Hello! I'm your VentureMind AI Agent. What kind of business are we building today? I can help you discover a profitable idea, layout an action plan roadmap, and set up your direct payouts." }
      ]
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
    setMessages(defaultSession.messages);
    localStorage.setItem(`venturemind_sessions_${uid}`, JSON.stringify([defaultSession]));
  };

  const getAutoTitle = (promptText: string) => {
    const clean = promptText.replace(/[💡📋💵]/g, '').trim();
    const words = clean.split(/\s+/);
    if (words.length <= 4) {
      return clean;
    }
    return words.slice(0, 4).join(' ') + '...';
  };

  const saveSessionMessages = (sid: string, newMessages: Message[]) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === sid) {
        let title = s.title;
        const genericNames = ['Launch Brainstorm', 'Venture Plan'];
        const isGeneric = genericNames.some(gn => title.startsWith(gn));
        
        const userMessage = newMessages.find(m => m.role === 'user');
        if (isGeneric && userMessage) {
          const matchedSug = SUGGESTIONS.find(sug => sug.prompt === userMessage.content);
          if (matchedSug) {
            title = matchedSug.title;
          } else {
            title = getAutoTitle(userMessage.content);
          }
        }

        return {
          ...s,
          title,
          messages: newMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    if (userId) {
      localStorage.setItem(`venturemind_sessions_${userId}`, JSON.stringify(updatedSessions));
    }
  };

  const startNewSession = () => {
    const newId = 'session-' + Date.now();
    const index = sessions.length + 1;
    const newSession: ChatSession = {
      id: newId,
      title: `Venture Plan #${index}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        { role: 'bot', content: "Hello! I'm your VentureMind AI Agent. What kind of business are we building today? I can help you discover a profitable idea, layout an action plan roadmap, and set up your direct payouts." }
      ]
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setSidebarOpen(false);

    if (userId) {
      localStorage.setItem(`venturemind_sessions_${userId}`, JSON.stringify(updated));
    }
  };

  const deleteSession = (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updated = sessions.filter(s => s.id !== sid);
    setSessions(updated);
    
    if (userId) {
      localStorage.setItem(`venturemind_sessions_${userId}`, JSON.stringify(updated));
    }

    if (activeSessionId === sid) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        const freshId = 'session-' + Date.now();
        const freshSession: ChatSession = {
          id: freshId,
          title: "Launch Brainstorm",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [
            { role: 'bot', content: "Hello! I'm your VentureMind AI Agent. What kind of business are we building today? I can help you discover a profitable idea, layout an action plan roadmap, and set up your direct payouts." }
          ]
        };
        setSessions([freshSession]);
        setActiveSessionId(freshId);
        setMessages(freshSession.messages);
        if (userId) {
          localStorage.setItem(`venturemind_sessions_${userId}`, JSON.stringify([freshSession]));
        }
      }
    }
  };

  const selectSession = (sid: string) => {
    const found = sessions.find(s => s.id === sid);
    if (found) {
      setActiveSessionId(sid);
      setMessages(found.messages);
      setSidebarOpen(false);
    }
  };

  const startRenameSession = (sid: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sid);
    setEditTitle(currentTitle);
  };

  const saveRenameSession = (sid: string) => {
    if (!editTitle.trim()) return;
    const updated = sessions.map(s => {
      if (s.id === sid) {
        return { ...s, title: editTitle.trim(), updatedAt: Date.now() };
      }
      return s;
    });
    setSessions(updated);
    setEditingSessionId(null);
    if (userId) {
      localStorage.setItem(`venturemind_sessions_${userId}`, JSON.stringify(updated));
    }
  };

  const sendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch('/api/venture/strategize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const data = await res.json();
      setMessages(prev => {
        const next = [...prev, { role: 'bot', content: data.text }];
        if (activeSessionId) {
          saveSessionMessages(activeSessionId, next);
        }
        return next;
      });
    } catch (error) {
      setMessages(prev => {
        const next = [...prev, { role: 'bot', content: "I encountered an error planning your strategy. Let's try again." }];
        if (activeSessionId) {
          saveSessionMessages(activeSessionId, next);
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading || !activeSessionId) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => {
      const next = [...prev, { role: 'user', content: userMsg }];
      saveSessionMessages(activeSessionId, next);
      sendPrompt(userMsg);
      return next;
    });
  };

  const handleSuggestionClick = (promptText: string) => {
    if (loading || !activeSessionId) return;
    setMessages(prev => {
      const next = [...prev, { role: 'user', content: promptText }];
      saveSessionMessages(activeSessionId, next);
      sendPrompt(promptText);
      return next;
    });
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredSessions = sessions.filter(s => {
    const titleMatch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const msgMatch = s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return titleMatch || msgMatch;
  });

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-12.5rem)] md:h-[calc(100vh-10rem)] bg-white border border-[#e5e5e0] rounded-[2rem] overflow-hidden">
      
      {/* Sidebar: Saved Venture Ideas (Shown on md+ as sidebar, toggled on mobile) */}
      <aside className={`
        ${sidebarOpen ? 'flex' : 'hidden md:flex'}
        flex-col w-full md:w-72 lg:w-80 flex-shrink-0 bg-neutral-50 border-r border-[#e5e5e0] h-full transition-all duration-300
      `}>
        {/* Header */}
        <div className="p-5 border-b border-[#e5e5e0] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <h4 className="font-bold text-sm tracking-tight">Idea Archives</h4>
            <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded-md text-[9px] font-bold">
              {sessions.length}
            </span>
          </div>
          <button
            onClick={startNewSession}
            className="p-2 hover:bg-neutral-200/60 rounded-xl transition-colors text-black flex items-center justify-center cursor-pointer border border-[#cbd5e1]/40"
            title="Start New Idea Brainstorm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-[#e5e5e0]/70">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Search ideas & details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-[#e5e5e0] rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Scrollable list of custom brainstorm sessions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = s.id === editingSessionId;
            
            return (
              <div
                key={s.id}
                onClick={() => !isEditing && selectSession(s.id)}
                className={`
                  group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-white border-black shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-neutral-100/80 hover:border-neutral-200'}
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRenameSession(s.id);
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                          className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:border-black font-semibold"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRenameSession(s.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h5 className={`font-bold text-xs truncate ${isActive ? 'text-black' : 'text-neutral-700'}`}>
                        {s.title}
                      </h5>
                    )}
                    
                    {/* Timestamp & message stats */}
                    <p className="text-[10px] text-neutral-400 font-medium mt-1 uppercase tracking-wider">
                      {formatDate(s.updatedAt)} • {s.messages.filter(m => m.role === 'user').length} queries
                    </p>
                  </div>

                  {/* Rename & Delete options */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRenameSession(s.id, s.title, e)}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-black cursor-pointer"
                        title="Rename Venture"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 cursor-pointer"
                        title="Delete Venture"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="p-8 text-center text-neutral-400">
              <p className="text-xs font-medium">No venture logs match search filter.</p>
            </div>
          )}
        </div>

        {/* Workspace state metadata footer */}
        <div className="p-4 border-t border-[#e5e5e0] bg-neutral-100/40 text-[10px] text-neutral-400 font-medium tracking-wide uppercase">
          Client Encrypted Archive
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <div className={`
        ${sidebarOpen ? 'hidden md:flex' : 'flex'}
        flex-col flex-1 h-full overflow-hidden
      `}>
        {/* Head Bar */}
        <div className="p-6 border-b border-[#e5e5e0] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            {/* Toggle History Side Drawer (Mobile/Tablet) */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="md:hidden p-2.5 bg-neutral-100 border border-neutral-250 rounded-xl hover:bg-neutral-200 transition-colors mr-1 flex items-center justify-center cursor-pointer"
              title="Toggle Idea Archives"
            >
              <History className="w-4 h-4 text-neutral-700" />
            </button>

            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base">Business Strategist</h3>
                <span className="text-[10px] px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-md font-bold text-neutral-500 font-mono">
                  {sessions.find(s => s.id === activeSessionId)?.title || "Active session"}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#FF6321] font-bold">Gemini 3.5 Flash Powered</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewSession}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-[#e5e5e0] bg-white text-black hover:border-black text-xs font-bold rounded-xl transition-all mr-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Idea
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              AGENT ONLINE
            </div>
          </div>
        </div>

        {/* Scrollable conversation logs */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-neutral-100' : 'bg-black text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-neutral-900 text-white rounded-tr-none' 
                      : 'bg-[#f5f5f4] text-neutral-800 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 space-y-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Quick Start Launchpad</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s.prompt)}
                      disabled={loading}
                      className="p-5 bg-neutral-50 border border-[#e5e5e0] rounded-2xl text-left hover:border-black hover:bg-neutral-950 hover:text-white transition-all duration-300 group disabled:opacity-50 cursor-pointer"
                    >
                      <h4 className="font-bold text-sm mb-1 group-hover:text-[#FF6321] transition-colors">{s.title}</h4>
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors leading-relaxed">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center animate-spin">
                  <Loader2 className="w-4 h-4" />
                </div>
                <div className="p-4 bg-[#f5f5f4] rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400 font-sans">Strategizing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input panel */}
        <div className="p-6 bg-[#fafafa] border-t border-[#e5e5e0]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your business idea or ask for a strategy..."
              className="w-full bg-white border border-[#e5e5e0] rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-3 bg-black text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-4 text-[10px] text-neutral-400 text-center uppercase tracking-widest font-medium">
            Note: This agent provides legal business advice. Always verify with local regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
