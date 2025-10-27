import React, { useState } from 'react';
import { Provider, Contact, Email, Specialty, Review, SpecialtyConfig } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import TagInput from './TagInput';
import { reviewNumericFields, reviewTranslations } from '../constants';

interface ProviderFormProps {
  provider: Provider | null;
  onSave: (provider: Provider) => void;
  onCancel: () => void;
  specialties: SpecialtyConfig[];
}

const initialProviderState: Omit<Provider, 'id'> = {
    name: '',
    specialties: [],
    contacts: [],
    emails: [],
    address: '',
    googleMapsUrl: '',
    website: '',
    socialMedia: {},
    customTags: [],
    review: null,
    serviceHistory: [],
    isFavorite: false,
};

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, onSave, onCancel, specialties }) => {
  const [formData, setFormData] = useState<Provider>(
    provider ? { ...provider } : { ...initialProviderState, id: `provider-${Date.now()}` }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialMedia.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, [field]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleSpecialty = (specialtyName: Specialty) => {
    setFormData(prev => {
        const currentSpecialties = prev.specialties || [];
        const isSelected = currentSpecialties.includes(specialtyName);
        
        const newSpecialties = isSelected
            ? currentSpecialties.filter(s => s !== specialtyName)
            : [...currentSpecialties, specialtyName];
        
        return { ...prev, specialties: newSpecialties };
    });
  };
  
  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { id: `contact-${Date.now()}`, type: 'Celular', value: '' }]
    }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const handleRemoveContact = (index: number) => {
    setFormData(prev => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) }));
  };
  
  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { id: `email-${Date.now()}`, tag: 'Principal', value: '' }]
    }));
  };

  const handleEmailChange = (index: number, field: keyof Email, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setFormData(prev => ({ ...prev, emails: newEmails }));
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }));
  };

  const handleReviewChange = (field: keyof Omit<Review, 'text'>, value: number) => {
      setFormData(prev => ({
          ...prev,
          review: {
              ...(prev.review || { 
                  agility: 0, 
                  upToDate: 0, 
                  talkative: 0, 
                  knowledge: 0, 
                  detailOriented: 0,
                  flexibility: 0, 
                  honesty: 0, 
                  cleanliness: 0, 
                  punctuality: 0, 
                  price: 0, 
                  quality: 0,
                  text: '' 
              }),
              [field]: value,
          }
      }));
  };

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, review: { ...(prev.review!), text: e.target.value } }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <h1 className="text-base font-bold text-primary dark:text-accent uppercase text-center">{provider ? 'Editar' : 'Adicionar'} Prestador</h1>
      
      <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold border-b pb-2">Informações Básicas</h2>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especialidades</label>
            <div className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex flex-wrap gap-2 min-h-[42px]">
                {specialties.map(s => {
                    const isSelected = formData.specialties.includes(s.name);
                    return (
                        <button
                            type="button"
                            key={s.name}
                            onClick={() => handleToggleSpecialty(s.name)}
                            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                                isSelected
                                    ? 'bg-primary text-white hover:bg-dark'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {s.name}
                        </button>
                    );
                })}
            </div>
        </div>
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <input name="website" value={formData.website} onChange={handleChange} placeholder="Website (https://...)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <label className="flex items-center space-x-2">
            <input type="checkbox" checked={formData.isFavorite} onChange={(e) => setFormData(p => ({...p, isFavorite: e.target.checked}))} />
            <span>Favorito</span>
        </label>
      </div>
      
      <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold border-b pb-2">Contatos</h2>
        {formData.contacts.map((contact, index) => (
            <div key={contact.id} className="flex items-center space-x-2">
                <input value={contact.type} onChange={(e) => handleContactChange(index, 'type', e.target.value)} placeholder="Tag (ex: WhatsApp)" className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 w-1/4"/>
                <input value={contact.value} onChange={(e) => handleContactChange(index, 'value', e.target.value)} placeholder="Número" type="tel" required className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex-grow"/>
                <button type="button" onClick={() => handleRemoveContact(index)} className="p-2 text-red-500"><Trash2/></button>
            </div>
        ))}
        <button type="button" onClick={handleAddContact} className="flex items-center space-x-2 text-secondary dark:text-accent"><Plus/><span>Adicionar Contato</span></button>

         {formData.emails.map((email, index) => (
            <div key={email.id} className="flex items-center space-x-2">
                <input value={email.tag} onChange={(e) => handleEmailChange(index, 'tag', e.target.value)} placeholder="Tag (ex: Pessoal)" className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 w-1/4"/>
                <input value={email.value} onChange={(e) => handleEmailChange(index, 'value', e.target.value)} placeholder="E-mail" type="email" required className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex-grow"/>
                <button type="button" onClick={() => handleRemoveEmail(index)} className="p-2 text-red-500"><Trash2/></button>
            </div>
        ))}
        <button type="button" onClick={handleAddEmail} className="flex items-center space-x-2 text-secondary dark:text-accent"><Plus/><span>Adicionar E-mail</span></button>
      </div>

       <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold border-b pb-2">Mídia Social</h2>
        <input name="socialMedia.instagram" value={formData.socialMedia.instagram || ''} onChange={handleChange} placeholder="Instagram (usuário)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <input name="socialMedia.tiktok" value={formData.socialMedia.tiktok || ''} onChange={handleChange} placeholder="TikTok (usuário)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <input name="socialMedia.facebook" value={formData.socialMedia.facebook || ''} onChange={handleChange} placeholder="Facebook (usuário)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <input name="socialMedia.linkedin" value={formData.socialMedia.linkedin || ''} onChange={handleChange} placeholder="LinkedIn (usuário)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
        <input name="socialMedia.x" value={formData.socialMedia.x || ''} onChange={handleChange} placeholder="X (usuário)" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
       </div>

      <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold border-b pb-2">Tags Personalizadas</h2>
        <TagInput
            tags={formData.customTags}
            onTagsChange={(newTags) => setFormData(prev => ({ ...prev, customTags: newTags }))}
            placeholder="Adicionar sub-especialidade e tecle Enter"
        />
      </div>

        <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold border-b pb-2">Avaliação</h2>
            {reviewNumericFields.map(key => (
                <div key={key} className="flex items-center justify-between">
                    <label className="text-sm">{reviewTranslations[key]}:</label>
                    <StarRating rating={formData.review?.[key] as number || 0} onRating={(rating) => handleReviewChange(key, rating)} />
                </div>
            ))}
            <textarea value={formData.review?.text || ''} onChange={handleReviewTextChange} placeholder="Comentário da avaliação" className="w-full p-2 border rounded h-24 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
        </div>


      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-dark">Salvar</button>
      </div>
    </form>
  );
};

export default ProviderForm;