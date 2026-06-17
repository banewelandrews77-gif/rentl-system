'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  LifeBuoy, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Search, 
  Filter, 
  Headphones, 
  Clock, 
  ArrowUpRight,
  Bot,
  User,
  Sparkles,
  X,
  MessageCircle,
  FileText,
  Check,
  ShieldAlert,
  HelpCircle,
  History
} from 'lucide-react';
import { API_BASE, supportApi, SupportTicketResponse, getToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const faqs = [
  {
    question: "How do I book a hostel room?",
    answer: "Simply browse our listings, select a hostel and room type you like, click 'Book Now', and follow the secure payment process via Paystack. Your reservation is confirmed instantly!",
    category: "bookings"
  },
  {
    question: "Is my payment secure?",
    answer: "Yes! We use Paystack, one of Africa's most secure and trusted payment gateways. Your card and mobile money details are never stored on our servers.",
    category: "payments"
  },
  {
    question: "What if I can't find a hostel near my campus?",
    answer: "We are constantly adding new verified hostels. Try using the campus filters or contact us directly, and we'll help you find a suitable place.",
    category: "bookings"
  },
  {
    question: "How do I become a verified agent?",
    answer: "Register as an agent, upload your business identification, and our team will review your application within 24-48 hours. Once approved, you can start listing properties.",
    category: "agents"
  },
  {
    question: "Can I get a refund after booking?",
    answer: "Refund policies vary by hostel. Please check the specific hostel's terms before booking. For disputes, you can contact our support team.",
    category: "payments"
  }
];

const categories = [
  { id: 'all', name: 'All FAQs' },
  { id: 'bookings', name: 'Hostels & Booking' },
  { id: 'payments', name: 'Payments & Safety' },
  { id: 'agents', name: 'For Agents' }
];

type Ticket = SupportTicketResponse;



export default function SupportPage() {
  const { user } = useAuth();
  
  // Navigation Tabs
  const [activeView, setActiveView] = useState<'submit' | 'history' | 'faqs'>('submit');

  // Contact Form State
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic FAQ states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // DB ticket tracker
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);



  // Sync auth user details with contact form
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Load tickets from DB (requires auth)
  const loadTickets = async () => {
    if (!user) return;
    setTicketsLoading(true);
    try {
      const data = await supportApi.getMyTickets();
      setTickets(data);
    } catch (e) {
      console.error('Failed to load tickets', e);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const newTicket = await supportApi.submitContact(formData);
      // Refresh full ticket list from DB so status is always accurate
      await loadTickets();
      setSubmitted(true);
      toast.success('Support ticket submitted successfully!');
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to submit ticket. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = searchQuery !== '' || activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24 overflow-x-hidden selection:bg-amber-200 selection:text-stone-950">
      
      {/* Premium Glass Ambient Backdrops */}
      <div className="absolute top-0 left-1/4 w-full h-[600px] bg-gradient-to-r from-amber-400/10 to-teal-400/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-rose-400/5 rounded-full blur-[140px] pointer-events-none" />

      {/* --- HERO HEADER --- */}
      <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-b from-stone-100 to-transparent border-b border-stone-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-900 text-[10px] font-black uppercase tracking-[0.2em] mb-5 shadow-sm"
          >
            <LifeBuoy className="h-3.5 w-3.5 animate-pulse text-amber-600" />
            Support Center
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-black tracking-tight text-stone-950 sm:text-6xl leading-tight"
          >
            Find Answers & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 italic">Get Help</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 mx-auto max-w-2xl text-stone-600 font-medium leading-relaxed"
          >
            Have a question? Browse common FAQs, track your support tickets, or chat with our live automated concierge helper below.
          </motion.p>
        </div>
      </section>

      {/* --- PORTAL MAIN CONTENT CONTROLLER (TABS) --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mt-8">
        
        {/* Support Portal Sub-navigation Tabs */}
        <div className="flex justify-center border-b border-stone-200 mb-12">
          <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl mb-2">
            <button
              onClick={() => setActiveView('submit')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeView === 'submit'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-amber-500" /> Submit Ticket
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 relative ${
                activeView === 'history'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <History className="h-4 w-4 text-amber-500" /> Ticket History
              {tickets.length > 0 && (
                <span className="bg-amber-600 text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
                  {tickets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('faqs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeView === 'faqs'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <HelpCircle className="h-4 w-4 text-amber-500" /> FAQs & Answers
            </button>
          </div>
        </div>

        {/* --- GRID VIEWS DEPENDING ON TAB --- */}
        <AnimatePresence mode="wait">
          {activeView === 'submit' && (
            <motion.div 
              key="submit-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Contacts */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-stone-400">Direct Contact Channels</h2>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4 hover:border-amber-500/40 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-amber-950 transition-all duration-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-stone-900 text-sm">Email Support</h3>
                    <p className="text-xs text-stone-500 mt-1 font-semibold">Support and dispute queries</p>
                    <a href="mailto:hostelconnectgh5@gmail.com" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold text-xs mt-3">
                      hostelconnectgh5@gmail.com
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-300">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-stone-900 text-sm">WhatsApp Hotlink</h3>
                    <p className="text-xs text-stone-500 mt-1 font-semibold">Immediate text-based support</p>
                    <a href="https://wa.me/233595934551" target="_blank" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs mt-3">
                      +233 59 593 4551
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4 hover:border-blue-500/40 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 group-hover:bg-blue-500 group-hover:text-blue-950 transition-all duration-300">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-stone-900 text-sm">Live Call Line</h3>
                    <p className="text-xs text-stone-500 mt-1 font-semibold">Active Mon-Fri, 8am-6pm</p>
                    <p className="text-stone-900 font-black text-xs mt-3">+233 59 593 4551</p>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Ticket Form */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    
                    <div className="md:col-span-7 p-8 lg:p-10">
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight">Direct Assistance</h2>
                      <p className="text-xs text-stone-500 mt-1 font-medium">Have a specific question? Submit a ticket and our agents will respond.</p>

                      <div className="mt-8">
                        {submitted ? (
                          <div className="text-center py-10">
                            <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mb-6">
                              <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-extrabold text-stone-900">Ticket Submitted</h3>
                            <p className="text-stone-505 mt-3 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                              Your support ticket was sent successfully. We have queued it in your browser session for tracking.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                              <button 
                                onClick={() => setSubmitted(false)}
                                className="text-xs font-black uppercase tracking-widest text-stone-600 hover:text-stone-950 bg-stone-50 px-6 py-3 rounded-xl border border-stone-200"
                              >
                                New Ticket
                              </button>
                              <button 
                                onClick={() => setActiveView('history')}
                                className="text-xs font-black uppercase tracking-widest text-white hover:bg-amber-500 bg-amber-600 px-6 py-3 rounded-xl shadow-md"
                              >
                                Track Tickets
                              </button>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Full Name</label>
                                <input 
                                  type="text" 
                                  name="name"
                                  required
                                  value={formData.name}
                                  onChange={handleChange}
                                  placeholder="John Doe"
                                  className="w-full rounded-xl border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Email Address</label>
                                <input 
                                  type="email" 
                                  name="email"
                                  required
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="john@example.com"
                                  className="w-full rounded-xl border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Subject</label>
                              <input 
                                type="text" 
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g., Booking verification inquiry"
                                className="w-full rounded-xl border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Message Details</label>
                              <textarea 
                                name="message"
                                required
                                rows={4}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your issue or question in detail..."
                                className="w-full rounded-xl border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border resize-none"
                              ></textarea>
                            </div>
                            
                            {error && (
                              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-100 font-bold">
                                {error}
                              </div>
                            )}

                            <button 
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full flex items-center justify-center gap-2 bg-stone-950 text-white rounded-xl py-4 font-black uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  Submit Ticket
                                </>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-5 bg-stone-950 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <h3 className="text-lg font-bold italic text-amber-500 leading-relaxed">
                          "Connecting students with secure, verified, and premium properties across Ghana."
                        </h3>
                        
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-3 text-xs">
                            <ShieldCheck className="h-4 text-amber-500" />
                            <p className="font-bold text-stone-300">100% Verified Listings</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Zap className="h-4 text-amber-500" />
                            <p className="font-bold text-stone-300">Instant Confirmations</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <LifeBuoy className="h-4 text-amber-500" />
                            <p className="font-bold text-stone-300">24/7 Portal Support</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Registered Office</div>
                        <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                          Takoradi Technical University,<br />
                          Takoradi — Ghana
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-950">Track Your Support Tickets</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {user ? 'Live status from our database — updates when admin responds.' : 'Log in to see your ticket history.'}
                  </p>
                </div>
                <button
                  onClick={loadTickets}
                  disabled={ticketsLoading}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-950 disabled:opacity-50 flex items-center gap-2"
                >
                  {ticketsLoading ? <div className="h-3 w-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" /> : null}
                  Refresh
                </button>
              </div>

              {ticketsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !user ? (
                <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-16 text-center">
                  <div className="h-16 w-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="h-6 w-6 text-stone-400" />
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900">Login Required</h3>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
                    Please log in to view and track your support tickets.
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-16 text-center">
                  <div className="h-16 w-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-stone-400" />
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900">No support tickets found</h3>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
                    Submit a ticket on the support form and it will appear here for live progress tracking.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                              #{String(ticket.id).slice(0, 8).toUpperCase()}
                            </span>
                            <h3 className="font-extrabold text-base text-stone-950">{ticket.subject}</h3>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">Submitted on {new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          ticket.status === 'IN_REVIEW' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-6 space-y-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Original Request</p>
                          <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            {ticket.message}
                          </p>
                        </div>

                        {/* Visual Ticket Progress Track */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Ticket Status Progress</p>
                          <div className="relative flex justify-between items-center max-w-lg mx-auto py-4">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
                            <div className={`absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-700 ${
                              ticket.status === 'RESOLVED' ? 'w-full' :
                              ticket.status === 'IN_REVIEW' ? 'w-1/2' :
                              'w-[5%]'
                            }`} />
                            {[{label:'Submitted', active: true}, {label:'In Review', active: ticket.status === 'IN_REVIEW' || ticket.status === 'RESOLVED'}, {label:'Resolved', active: ticket.status === 'RESOLVED'}].map((step, i) => (
                              <div key={i} className="relative z-10 flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md transition-colors ${
                                  step.active ? (i === 2 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-stone-300'
                                }`}>{i + 1}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-800 mt-2">{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Admin Response */}
                        <div className="pt-4 border-t border-stone-100">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Admin Response</p>
                          {ticket.adminResponse ? (
                            <div className="flex gap-4 items-start">
                              <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                              <div>
                                <h4 className="font-extrabold text-stone-900 text-sm">Support Team Reply</h4>
                                <p className="text-sm text-stone-600 mt-1 leading-relaxed bg-indigo-50 p-3 rounded-xl border border-indigo-100">{ticket.adminResponse}</p>
                                <span className="text-[10px] text-stone-400">{new Date(ticket.updatedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 items-center text-xs text-stone-400">
                              <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                              Awaiting admin response — we typically reply within 15 minutes.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'faqs' && (
            <motion.div 
              key="faqs-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Category selector */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenFaq(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'bg-stone-950 text-white shadow-lg shadow-stone-950/10'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900 shadow-sm'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Accordions */}
              <div className="space-y-3.5">
                {filteredFaqs.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center">
                    <div className="h-12 w-12 bg-stone-100 border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="h-5 w-5 text-stone-400" />
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base">No match found</h4>
                    <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
                      We could not find any FAQs matching your selection.
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const globalIndex = faqs.findIndex(f => f.question === faq.question);
                    const isOpen = openFaq === globalIndex;
                    return (
                      <div 
                        key={faq.question}
                        className={`rounded-2xl border transition-all duration-300 bg-white ${
                          isOpen 
                            ? 'border-amber-500/50 shadow-md shadow-amber-500/5' 
                            : 'border-stone-200/80 hover:bg-stone-50/20 hover:border-stone-300 shadow-sm'
                        }`}
                      >
                        <button 
                          onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                          className="w-full flex items-center justify-between p-5 text-left transition-colors"
                        >
                          <span className={`font-extrabold text-sm sm:text-base tracking-wide transition-colors ${
                            isOpen ? 'text-amber-600' : 'text-stone-900'
                          }`}>
                            {faq.question}
                          </span>
                          <div className={`p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-500 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-amber-600 border-amber-500/20 bg-amber-50/50' : ''
                          }`}>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </button>
                        
                        {isOpen && (
                          <div className="px-5 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-4 mt-1">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



    </div>
  );
}
