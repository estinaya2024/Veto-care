import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { PetAvatar } from './PetAvatar';
import logo from '../../assets/images/logo-icon-only.png';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'vet' | 'owner';
  text: string;
  timestamp: Date;
}

export function SecureChat() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'clinic',
      senderRole: 'vet',
      text: 'Bonjour ! Comment pouvons-nous vous aider aujourd\'hui ?',
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderRole: role as 'vet' | 'owner',
      text: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages([...messages, msg]);
    setNewMessage('');

    // Mock auto-reply if user is owner
    if (role === 'owner') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          senderId: 'clinic',
          senderRole: 'vet',
          text: 'Message reçu par le secrétariat médical. Un vétérinaire vous répondra dès sa sortie de consultation. En cas d\'urgence absolue, appelez le standard.',
          timestamp: new Date()
        }]);
      }, 2000);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 w-16 h-16 rounded-full bg-veto-black text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:bg-veto-yellow z-50 group",
          isOpen && "hidden"
        )}
      >
        <MessageCircle size={28} className="group-hover:text-black transition-colors" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-[100] animate-fadeInRight border border-black/5">
          {/* Header */}
          <div className="p-6 bg-veto-black text-white flex justify-between items-center relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white rounded-[1rem] flex items-center justify-center p-2 shadow-sm">
                   <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                   <h3 className="font-black text-lg">Support VetoCare</h3>
                   <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                     <span className="text-[10px] font-black uppercase tracking-widest">En Ligne</span>
                   </div>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-veto-yellow hover:text-black transition-colors relative z-10">
               <X size={20} />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[9px] font-black uppercase tracking-widest bg-gray-200/50 text-veto-gray px-4 py-1.5 rounded-full">
                La connexion est chiffrée
              </span>
            </div>

            {messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMine ? "self-end items-end" : "self-start items-start")}>
                  <div className="flex items-end gap-2 mb-1">
                    {!isMine && (
                       <div className="w-6 h-6 rounded-lg bg-veto-blue-gray flex items-center justify-center text-veto-black mb-1 shrink-0">
                          <HeartPulse size={12} />
                       </div>
                    )}
                    <div className={cn(
                      "p-4 text-sm font-medium leading-relaxed rounded-3xl",
                      isMine 
                        ? "bg-veto-black text-white rounded-br-sm" 
                        : "bg-white text-veto-black border border-black/5 shadow-sm rounded-bl-sm"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-veto-gray tracking-widest uppercase opacity-60 px-2">
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-black/5 shrink-0">
             <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-veto-yellow transition-shadow"
                />
                <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-veto-yellow rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors shadow-sm">
                   <Send size={20} className="text-veto-black ml-1" />
                </button>
             </form>
          </div>
        </div>
      )}
    </>
  );
}
