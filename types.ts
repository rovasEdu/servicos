

export type Specialty = string;

export interface SpecialtyConfig {
  name: Specialty;
  icon: string; // Nome do ícone de lucide-react
}

export type ContactType = 'WhatsApp' | 'Telegram' | 'Celular' | 'Fixo';

export interface Contact {
  id: string;
  type: ContactType | string; // Allows custom tags
  value: string;
}

export interface Email {
    id: string;
    tag: string;
    value: string;
}

export interface SocialMedia {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  x?: string;
}

export interface Review {
  agility: number; // 1-5
  cleanliness: number; // 1-5
  detailOriented: number; // 1-5
  flexibility: number; // 1-5
  honesty: number; // 1-5
  knowledge: number; // 1-5
  price: number; // 1-5
  punctuality: number; // 1-5
  quality: number; // 1-5
  talkative: number; // 1-5
  upToDate: number; // 1-5
  text: string;
}

export interface ServiceRecord {
  id: string;
  description: string;
  date: string;
  duration: string; // "X dias" or "Y horas"
  price: number;
  media: { type: 'image' | 'video'; url: string }[];
  tags: string[];
  rating: number; // 1-10
}

export interface Provider {
  id: string;
  name: string;
  specialties: Specialty[];
  contacts: Contact[];
  emails: Email[];
  address: string;
  googleMapsUrl?: string;
  website?: string;
  socialMedia: SocialMedia;
  customTags: string[];
  review: Review | null;
  serviceHistory: ServiceRecord[];
  isFavorite: boolean;
}

export type ProviderForOcr = Omit<Provider, 'id' | 'review' | 'serviceHistory' | 'isFavorite'>;

export type View =
  | { type: 'home' }
  | { type: 'list'; specialty: Specialty }
  | { type: 'detail'; provider: Provider }
  | { type: 'form'; provider: Provider | null }
  | { type: 'settings' }
  | { type: 'ocr' }
  | { type: 'search' };