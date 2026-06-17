'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageCircle } from 'lucide-react';

type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: string[];
};

export function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Initialize bot greeting
  useEffect(() => {
    setChatMessages([
      {
        id: '1',
        sender: 'bot',
        text: `Hi there! 👋 I am your HostelConnect Helper. How can I assist you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: [
          'How do I book a hostel?',
          'Is my payment secure?',
          'Agent verification help',
          'Contact an administrator'
        ]
      }
    ]);
  }, []);

  const handleChatOption = (option: string) => {
    addUserMessage(option);
    triggerBotResponse(option);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const messageText = chatInput;
    addUserMessage(messageText);
    setChatInput('');
    triggerBotResponse(messageText);
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const triggerBotResponse = (query: string) => {
    setIsBotTyping(true);
    
    setTimeout(() => {
      let reply = `I'm not sure about that particular request. Feel free to contact our administrative team at hostelconnectgh5@gmail.com!`;
      let nextOptions = ['Need help with bookings', 'Contact info', 'Back to options'];
      
      const q = query.toLowerCase();
      if (q.includes('book') || q.includes('how do i book')) {
        reply = `To book a hostel room:\n1. Go to our Listings page.\n2. Pick a hostel and click on a room type.\n3. Click 'Book Now' and complete the Paystack transaction.\n\nYou will receive a confirmation receipt immediately!`;
        nextOptions = ['Payment safety', 'Agent support', 'Back to main'];
      } else if (q.includes('payment') || q.includes('secure')) {
        reply = `Absolutely secure! We use Paystack for payments, supporting Mobile Money (MTN, Telecel, AT) and bank cards. We do not store any of your sensitive banking information on our system.`;
        nextOptions = ['How to book', 'Refund question', 'Main options'];
      } else if (q.includes('agent') || q.includes('verify')) {
        reply = `For agents:\nSign up as an Agent, visit your Agent Dashboard, and complete the identity verification form with your Ghana Card and a live facial photo. Our administrative team verifies portals within 24-48 hours.`;
        nextOptions = ['Upload issues', 'Main options'];
      } else if (q.includes('admin') || q.includes('contact')) {
        reply = `You can call or text our call center at +233 59 593 4551 (Mon-Fri 8am-6pm) or email us directly at hostelconnectgh5@gmail.com. We answer all emails within 15 minutes!`;
        nextOptions = ['WhatsApp support', 'Submit a ticket'];
      } else if (q.includes('whatsapp')) {
        reply = `You can initiate a chat with us directly on WhatsApp by tapping the WhatsApp Hotlink card on our Support Page or clicking here: https://wa.me/233595934551`;
        nextOptions = ['Call support', 'Main options'];
      } else if (q.includes('refund')) {
        reply = `Refund policies are custom to each hostel listed on the platform. Please view the 'Hostel Policies' in the details page of the hostel before booking. For unresolved disputes, write to us!`;
        nextOptions = ['Main options'];
      } else if (q.includes('back') || q.includes('main') || q.includes('options')) {
        reply = `Sure! What other info do you need?`;
        nextOptions = [
          'How do I book a hostel?',
          'Is my payment secure?',
          'Agent verification help',
          'Contact an administrator'
        ];
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: nextOptions
        }
      ]);
      setIsBotTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[90]">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{ position: 'fixed', bottom: 96, right: 24, maxHeight: 'calc(100vh - 192px)' }}
            className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Chat Header */}
            <div className="bg-stone-950 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-500 rounded-2xl flex items-center justify-center text-stone-950 font-bold">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">HostelConnect Concierge</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Automated Bot</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-semibold shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-white text-stone-850 rounded-bl-none border border-stone-200'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold mt-1 uppercase tracking-wider">{msg.time}</span>
                  
                  {/* Bot helper options bubbles */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3.5 max-w-[90%]">
                      {msg.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleChatOption(opt)}
                          className="bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-200 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide transition-all shadow-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isBotTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200 w-fit">
                  <span className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-stone-200 flex gap-2 items-center bg-white">
              <input
                type="text"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="h-9 w-9 bg-stone-950 text-white rounded-2xl flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{ position: 'fixed', bottom: 24, right: 24 }}
        className="h-14 w-14 rounded-full bg-stone-950 hover:bg-amber-600 text-white flex items-center justify-center shadow-2xl border border-stone-800 pointer-events-auto transition-colors duration-200"
      >
        {isChatOpen
          ? <X className="h-6 w-6" />
          : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
