'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Send,
  ChevronDown,
  RefreshCw,
  Inbox,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';
import { supportApi, SupportTicketResponse } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    pulse: true
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    pulse: false
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    pulse: false
  }
};

function AdminSupportContent() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reply modal state
  const [replyTicket, setReplyTicket] = useState<SupportTicketResponse | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'IN_REVIEW' | 'RESOLVED'>('RESOLVED');
  const [replying, setReplying] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportApi.adminGetTickets();
      // Sort newest first
      setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e: any) {
      toast.error('Failed to load support tickets: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleReply = async () => {
    if (!replyTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await supportApi.adminRespondTicket(replyTicket.id, {
        status: replyStatus,
        response: replyText.trim()
      });
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Response sent successfully!');
      setReplyTicket(null);
      setReplyText('');
    } catch (e: any) {
      toast.error('Failed to send response: ' + e.message);
    } finally {
      setReplying(false);
    }
  };

  const counts = {
    ALL: tickets.length,
    SUBMITTED: tickets.filter(t => t.status === 'SUBMITTED').length,
    IN_REVIEW: tickets.filter(t => t.status === 'IN_REVIEW').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  const filtered = tickets.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.subject.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[800px] h-[400px] bg-gradient-to-r from-amber-400/8 to-teal-400/5 rounded-full blur-[160px]" />

      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-black text-stone-900 tracking-tight">Support Tickets</h1>
              <p className="text-xs text-stone-500 font-medium">{counts.ALL} total &middot; {counts.SUBMITTED} awaiting reply</p>
            </div>
          </div>
          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status filter tabs */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
            {(['ALL', 'SUBMITTED', 'IN_REVIEW', 'RESOLVED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filterStatus === s
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {s === 'SUBMITTED' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                {s === 'IN_REVIEW' && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                {s === 'RESOLVED' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                <span className="bg-stone-200 text-stone-600 rounded-full px-1.5 py-0.5 text-[9px] font-black">
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or subject..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            />
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-20 text-center">
            <div className="h-16 w-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">No tickets found</h3>
            <p className="text-xs text-stone-500 mt-1.5">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(ticket => {
                const cfg = STATUS_CONFIG[ticket.status];
                const isExpanded = expandedId === ticket.id;
                return (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                  >
                    {/* Ticket Header — always visible */}
                    <button
                      className="w-full p-5 flex items-start sm:items-center gap-4 text-left hover:bg-stone-50/50 transition"
                      onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    >
                      <div className={`mt-0.5 sm:mt-0 h-2.5 w-2.5 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                          <h3 className="font-extrabold text-sm text-stone-900 truncate">{ticket.subject}</h3>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          <span className="font-semibold text-stone-700">{ticket.name}</span> &middot; {ticket.email} &middot; {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {ticket.adminResponse ? (
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 hidden sm:block">Replied</span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 animate-pulse hidden sm:block">Needs Reply</span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">
                            {/* User's message */}
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">User's Message</p>
                              <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                                {ticket.message}
                              </p>
                            </div>

                            {/* Admin's previous response */}
                            {ticket.adminResponse && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Your Previous Response</p>
                                <p className="text-sm text-stone-700 leading-relaxed bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                  {ticket.adminResponse}
                                </p>
                              </div>
                            )}

                            {/* Reply action */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  setReplyTicket(ticket);
                                  setReplyText(ticket.adminResponse || '');
                                  setReplyStatus(ticket.status === 'RESOLVED' ? 'RESOLVED' : 'IN_REVIEW');
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-950 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition"
                              >
                                <Send className="h-3.5 w-3.5" />
                                {ticket.adminResponse ? 'Update Response' : 'Reply to Ticket'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-stone-900">Reply to Ticket</h2>
                  <p className="text-xs text-stone-500 mt-1 truncate max-w-sm">Re: {replyTicket.subject}</p>
                </div>
                <button
                  onClick={() => setReplyTicket(null)}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* User's original message */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">From: {replyTicket.name}</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{replyTicket.message}</p>
                </div>

                {/* Response text */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Your Response</label>
                  <textarea
                    rows={5}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your response to the user here..."
                    className="w-full rounded-xl border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition border resize-none"
                  />
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Update Ticket Status</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setReplyStatus('IN_REVIEW')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                        replyStatus === 'IN_REVIEW'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-indigo-300'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      In Review
                    </button>
                    <button
                      onClick={() => setReplyStatus('RESOLVED')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition ${
                        replyStatus === 'RESOLVED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setReplyTicket(null)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-950 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {replying ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Send Reply</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminSupportContent />
    </RequireAuth>
  );
}
