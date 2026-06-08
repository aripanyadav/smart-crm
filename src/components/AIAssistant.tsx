import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { aiAssistantService } from '../services/aiAssistantService';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const QUICK_PROMPTS = [
  "What should I focus on today?",
  "Show me hot leads",
  "Any pending payments?",
  "Give me a business summary"
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'ai',
    content: "Hi! I'm your Nowworks AI Assistant. How can I help you manage your business today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: promptText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAssistantService.sendMessage(promptText);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: error.message || 'AI assistant is temporarily unavailable. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_24px_rgba(34,197,94,0.4)] hover:shadow-[0_4px_32px_rgba(34,197,94,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50 ring-4 ring-primary/10 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6 animate-spin-slow" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-[380px] h-[600px] max-h-[80vh] bg-white/95 dark:bg-[#12141a]/95 backdrop-blur-md border border-gray-200/70 dark:border-gray-800/40 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-[#12141a] dark:to-[#08090c] border-b border-gray-200/70 dark:border-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Nowworks AI</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200/40 dark:border-gray-700 rounded-full shadow-sm active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-white/40 dark:bg-[#08090c]/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm shadow-md shadow-green-500/10' 
                    : 'bg-gray-100/90 dark:bg-[#12141a] text-gray-800 dark:text-gray-200 border border-gray-200/20 dark:border-gray-700/50 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100/90 dark:bg-[#12141a] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 border border-gray-200/20 dark:border-gray-700/50">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto custom-scrollbar border-t border-gray-200/70 dark:border-gray-800/40 bg-gray-50/50 dark:bg-[#12141a]/40">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                disabled={isLoading}
                className="shrink-0 px-3.5 py-1.5 bg-white dark:bg-[#12141a] border border-gray-300/30 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-full hover:border-primary hover:text-primary transition-all duration-200 btn-premium active:scale-95 disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#12141a] border-t border-gray-200/70 dark:border-gray-800/40">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-gray-50 dark:bg-[#08090c] border border-gray-200/40 dark:border-gray-800/45 px-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-gray-900 dark:text-white disabled:opacity-50 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-primary text-white rounded-xl shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-95 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 duration-200 btn-premium flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
