import { LucideProps, Construction } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { Review } from './types';

// As especialidades e ícones agora são gerenciados dinamicamente pelo useSpecialties hook.
// Este arquivo é mantido para outras constantes que possam ser necessárias no futuro.

export const DEFAUT_ICON: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> = Construction;

export const reviewTranslations: Record<keyof Omit<Review, 'text'>, string> = {
    agility: 'Agilidade',
    upToDate: 'Atualizado',
    talkative: 'Comunicação',
    knowledge: 'Conhecimento',
    detailOriented: 'Detalhista',
    flexibility: 'Flexibilidade',
    honesty: 'Honestidade',
    cleanliness: 'Limpeza',
    punctuality: 'Pontualidade',
    price: 'Preço',
    quality: 'Qualidade',
};

export const reviewNumericFields: Array<keyof Omit<Review, 'text'>> = [
    'agility',
    'upToDate',
    'talkative',
    'knowledge',
    'detailOriented',
    'flexibility',
    'honesty',
    'cleanliness',
    'punctuality',
    'price',
    'quality',
];