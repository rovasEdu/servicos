
import React, { useState } from 'react';
import { Provider, Contact, Review } from '../types';
import { ChevronLeft, Edit, Trash2, Share2, Phone, Mail, Globe, MapPin, Star, MessageSquare, QrCode } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { reviewTranslations, reviewNumericFields } from '../constants';

interface ProviderDetailProps {
  provider: Provider;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const getContactLink = (contact: Contact) => {
    const number = contact.value.replace(/\D/g, '');
    switch(contact.type){
        case 'WhatsApp': return `https://wa.me/55${number}`;
        case 'Telegram': return `https://t.me/+55${number}`;
        case 'Celular':
        case 'Fixo':
            return `tel:+55${number}`;
        default:
            return `tel:+55${number}`;
    }
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ provider, onBack, onEdit, onDelete }) => {
    const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);

    const handleShare = (type: 'qr' | 'whatsapp' | 'simple' | 'rich' | 'pdf') => {
        const simpleText = `
*${provider.name}*
Especialidades: ${provider.specialties.join(', ')}
${provider.contacts.map(c => `${c.type}: ${c.value}`).join('\n')}
Endereço: ${provider.address}
        `.trim();
        
        switch (type) {
            case 'qr':
                const qrText = `BEGIN:VCARD\nVERSION:3.0\nN:${provider.name}\nFN:${provider.name}\n${provider.contacts.map(c => `TEL;TYPE=${c.type.toUpperCase()}:${c.value}`).join('\n')}\nADR;TYPE=WORK:${provider.address}\nEND:VCARD`;
                setQrCodeValue(qrText);
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(simpleText)}`);
                break;
            case 'simple':
                navigator.clipboard.writeText(simpleText);
                alert('Cópia simples copiada para a área de transferência!');
                break;
            case 'rich':
                 // Fallback to simple for now
                navigator.clipboard.writeText(simpleText);
                alert('Cópia rica (texto simples) copiada para a área de transferência!');
                break;
            case 'pdf':
                const input = document.getElementById('provider-detail-pdf');
                if (input) {
                    html2canvas(input).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF();
                        const imgProps= pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`${provider.name}.pdf`);
                    });
                }
                break;
        }
    };
    
    return (
    <div className="p-4" id="provider-detail-pdf">
      {qrCodeValue && <QRCodeModal value={qrCodeValue} onClose={() => setQrCodeValue(null)} title={`QR Code para ${provider.name}`} />}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft className="w-6 h-6 text-primary dark:text-accent" />
        </button>
        <div className="flex items-center space-x-2">
            <button onClick={() => handleShare('qr')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><QrCode className="w-5 h-5"/></button>
            <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Edit className="w-5 h-5"/></button>
            <button onClick={() => { if(confirm('Tem certeza?')) onDelete(provider.id)}} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-primary dark:text-accent uppercase">{provider.name}</h1>
        <div className="mt-2 flex flex-wrap justify-center gap-2 min-h-[2.5rem]">
          {provider.specialties.map(s => <span key={s} className="px-3 py-1 bg-light dark:bg-gray-700 text-secondary dark:text-accent text-sm rounded-full">{s}</span>)}
          {provider.customTags.map(t => <span key={t} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full">{t}</span>)}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Contato</h2>
        {provider.contacts.map(contact => (
            <a key={contact.id} href={getContactLink(contact)} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="flex-grow truncate min-w-0">{contact.value}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0">{contact.type}</span>
            </a>
        ))}
        {provider.emails.map(email => (
            <a key={email.id} href={`mailto:${email.value}`} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="flex-grow truncate min-w-0">{email.value}</span>
                 <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0">{email.tag}</span>
            </a>
        ))}
        {provider.address && (
            <a href={provider.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <span className="flex-grow min-w-0">{provider.address}</span>
            </a>
        )}
        {provider.website && (
            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">
                <Globe className="w-5 h-5 flex-shrink-0" />
                <span className="flex-grow truncate min-w-0">{provider.website}</span>
            </a>
        )}
      </div>

       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4 mt-6">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Mídia Social</h2>
        <div className="flex flex-wrap gap-4">
        {provider.socialMedia.instagram && <a href={`https://instagram.com/${provider.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500">Instagram</a>}
        {provider.socialMedia.tiktok && <a href={`https://tiktok.com/@${provider.socialMedia.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white">TikTok</a>}
        {provider.socialMedia.facebook && <a href={`https://facebook.com/${provider.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">Facebook</a>}
        {provider.socialMedia.linkedin && <a href={`https://linkedin.com/in/${provider.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">LinkedIn</a>}
        {provider.socialMedia.x && <a href={`https://x.com/${provider.socialMedia.x}`} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white">X</a>}
        </div>
      </div>

       {provider.review && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Avaliação</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
            {reviewNumericFields.map(key => {
              const value = provider.review?.[key as keyof Omit<Review, 'text'>] ?? 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span>{reviewTranslations[key as keyof Omit<Review, 'text'>]}:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                  </div>
                </div>
              );
            })}
            </div>
            <p className="text-gray-600 dark:text-gray-400 italic">"{provider.review.text}"</p>
        </div>}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Histórico de Serviços</h2>
            {provider.serviceHistory.length === 0 ? <p className="text-gray-500">Nenhum serviço registrado.</p> :
            <div className="space-y-4">
                {provider.serviceHistory.map(service => (
                    <div key={service.id} className="border-b pb-2">
                        <p className="font-semibold">{service.description}</p>
                        <p className="text-sm text-gray-500">{service.date} - {service.duration} - R${service.price}</p>
                        <p className="text-sm">Avaliação: {service.rating}/10</p>
                    </div>
                ))}
            </div>
            }
        </div>
        
        <div className="mt-8 text-center">
            <button onClick={() => handleShare('pdf')} className="bg-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">Exportar para PDF</button>
        </div>
    </div>
  );
};

export default ProviderDetail;