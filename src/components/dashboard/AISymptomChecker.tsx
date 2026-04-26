import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import aiPawIcon from '../../assets/ai_paw.png';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  showAction?: boolean;
};

interface AISymptomCheckerProps {
  onBookAppointment: () => void;
}

export function AISymptomChecker({ onBookAppointment }: AISymptomCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Bonjour ! Je suis l'assistant vétérinaire IA de VetoCare. Quels symptômes présente votre animal aujourd'hui ?",
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.chatSymptom(userMsg.text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply || "Je suis désolé, je n'ai pas pu analyser ces symptômes.",
        showAction: true, // Toujours encourager la prise de RDV
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Désolé, il y a eu un problème de connexion avec l'IA. Veuillez réessayer plus tard ou prendre rendez-vous directement.",
        showAction: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl w-[350px] sm:w-[400px] h-[500px] mb-4 flex flex-col overflow-hidden animate-fadeInUp">

          {/* Header */}
          <div className="bg-gradient-to-r from-veto-black to-gray-800 p-4 text-white flex justify-between items-center rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white rounded-full flex items-center justify-center">
                <img src={aiPawIcon} alt="AI" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant Santé IA</h3>
                <p className="text-[10px] text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> En ligne
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[85%]",
                  msg.sender === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.sender === 'user'
                      ? "bg-veto-yellow text-veto-black rounded-br-sm font-medium"
                      : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
                  )}
                >
                  <p>{msg.text}</p>

                  {msg.showAction && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="black"
                        className="w-full text-xs py-2 shadow-premium"
                        onClick={() => {
                          setIsOpen(false);
                          onBookAppointment();
                        }}
                      >
                        <CalendarIcon size={14} className="mr-2" />
                        Prendre Rendez-vous
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex mr-auto justify-start max-w-[85%]">
                <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Décrivez les symptômes..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-veto-yellow transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-veto-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-veto-black transition-colors"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white text-veto-black p-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform flex items-center justify-center relative group border border-gray-100"
        >
          <img src={aiPawIcon} alt="AI" className="w-8 h-8 object-contain" />

          {/* Tooltip / Badge */}
          <span className="absolute -top-10 right-0 bg-white text-veto-black text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Assistant IA
          </span>

          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-veto-black"></span>
        </button>
      )}
    </div>
  );
}
