
export enum LeadStatus {
  NEW = 'Novo',
  ACTIVE = 'Ativo',
  RISK = 'Risco'
}

export interface Contact {
  id: string;
  name: string;
  whatsapp: string;
  birthday: string;
  status: LeadStatus;
  lists: string[];
}

export interface ContactList {
  id: string;
  name: string;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  mediaUrl?: string;
  speed: 'Seguro' | 'Normal' | 'Rápido';
  scheduleStart: string;
  scheduleEnd: string;
  pauseCycle: number;
  status: 'Draft' | 'Running' | 'Completed' | 'Paused';
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

export interface ChatbotRule {
  id: string;
  trigger: string;
  response: string;
  matchType: 'Exact' | 'Contains';
}

export interface ChatbotConfig {
  aiPersona: string;
  enabled: boolean;
  model: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  fromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}
