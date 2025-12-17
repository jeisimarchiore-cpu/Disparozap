
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Bot, 
  MessageSquare, 
  Smartphone, 
  Settings,
  ShieldAlert,
  Copy,
  CheckCircle2,
  ExternalLink,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContactsManager from './components/ContactsManager';
import CampaignManager from './components/CampaignManager';
import ChatbotManager from './components/ChatbotManager';
import Conversations from './components/Conversations';
import DeviceConnection from './components/DeviceConnection';
import Integrations from './components/Integrations';
import { Contact, Message, ChatbotConfig } from './types';
import { getCollectionRef, getDocRef, onSnapshot } from './services/firebaseService';

type View = 'dashboard' | 'contacts' | 'campaigns' | 'chatbot' | 'conversations' | 'device' | 'integrations';
type ConnectionStatus = 'connecting' | 'online' | 'error';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>({
    enabled: true,
    aiPersona: "Você é o atendente virtual da ZapFlow Pro. Seja educado e direto.",
    model: "gemini-3-flash-preview"
  });

  // Sync Global State
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    try {
      // Sync Contacts
      const unsubContacts = onSnapshot(getCollectionRef('contacts'), 
        (snapshot) => {
          setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
          setPermissionError(false);
          setConnectionStatus('online');
        },
        (err) => {
          if (err.code === 'permission-denied') setPermissionError(true);
          setConnectionStatus('error');
        }
      );
      unsubscribes.push(unsubContacts);

      // Sync Chatbot Config
      const unsubConfig = onSnapshot(getDocRef('chatbot_config', 'settings'), (doc) => {
        if (doc.exists()) setChatbotConfig(doc.data() as ChatbotConfig);
      });
      unsubscribes.push(unsubConfig);

      // Sync Messages
      const unsubMessages = onSnapshot(getCollectionRef('messages'), (snapshot) => {
        const msgsByChat: Record<string, Message[]> = {};
        snapshot.docs.forEach(doc => {
          const msg = { id: doc.id, ...doc.data() } as Message;
          const target = msg.fromMe ? '1' : msg.senderId;
          if (!msgsByChat[target]) msgsByChat[target] = [];
          msgsByChat[target].push(msg);
        });
        setMessages(msgsByChat);
      });
      unsubscribes.push(unsubMessages);

    } catch (e) {
      setConnectionStatus('error');
    }

    return () => unsubscribes.forEach(u => u());
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard totalLeads={contacts.length} />;
      case 'contacts': return <ContactsManager contacts={contacts} />;
      case 'campaigns': return <CampaignManager />;
      case 'chatbot': return <ChatbotManager config={chatbotConfig} />;
      case 'conversations': return (
        <Conversations 
          globalMessages={messages} 
          chatbotEnabled={chatbotConfig.enabled}
          aiPersona={chatbotConfig.aiPersona}
        />
      );
      case 'device': return <DeviceConnection />;
      case 'integrations': return <Integrations />;
      default: return <Dashboard totalLeads={contacts.length} />;
    }
  };

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-rose-100 overflow-hidden">
          <div className="bg-rose-500 p-8 text-white flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-2xl">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Acesso Negado (Firestore)</h1>
              <p className="text-rose-100 opacity-90">Verifique as regras do projeto zapflow25</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="bg-gray-900 rounded-xl p-4 relative group">
              <pre className="text-emerald-400 text-xs font-mono overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[10px]"
              >
                <Copy className="w-4 h-4" /> COPIAR REGRAS
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
               <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                 Tentar Novamente <CheckCircle2 className="w-5 h-5" />
               </button>
               <a href="https://console.firebase.google.com/project/zapflow25/firestore/rules" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-gray-600 font-bold border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all">
                 Abrir Rules <ExternalLink className="w-4 h-4" />
               </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-800 overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20 shadow-sm`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl shrink-0">
            <Send className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl text-gray-900">ZapFlow <span className="text-emerald-500">Pro</span></span>}
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'contacts', label: 'Contatos', icon: Users },
            { id: 'campaigns', label: 'Campanhas', icon: Send },
            { id: 'chatbot', label: 'Chatbot', icon: Bot },
            { id: 'conversations', label: 'Conversas', icon: MessageSquare },
            { id: 'device', label: 'Dispositivo', icon: Smartphone },
            { id: 'integrations', label: 'Integrações', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${activeView === item.id ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">ZapFlow Cloud</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {connectionStatus === 'online' && (
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 uppercase">
                 <Wifi className="w-3 h-3" />
                 Firebase Online
               </div>
             )}
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">ZF</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
