import React, { useState, useEffect, useCallback } from 'react';
import { SpecialtyConfig } from '../types';
import { Check, X, Loader2, Wand2 } from 'lucide-react';
import { suggestIconsForSpecialty } from '../services/geminiService';
import { getIcon, getIconNames } from '../services/iconService';

interface SpecialtyEditorProps {
    specialty: SpecialtyConfig | null; // null for adding new
    onSave: (oldName: string | null, newSpecialty: SpecialtyConfig) => void;
    onCancel: () => void;
    existingNames: string[];
}

const SpecialtyEditor: React.FC<SpecialtyEditorProps> = ({ specialty, onSave, onCancel, existingNames }) => {
    const [name, setName] = useState(specialty?.name || '');
    const [icon, setIcon] = useState(specialty?.icon || 'Construction');
    const [suggestedIcons, setSuggestedIcons] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const iconNames = getIconNames();

    const fetchIconSuggestions = useCallback(async (specialtyName: string) => {
        if (!specialtyName) return;
        setIsLoading(true);
        try {
            const icons = await suggestIconsForSpecialty(specialtyName, iconNames);
            setSuggestedIcons(icons);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [iconNames]);
    
    useEffect(() => {
        if (specialty?.name) {
            fetchIconSuggestions(specialty.name);
        }
    }, [specialty, fetchIconSuggestions]);

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('O nome não pode estar vazio.');
            return;
        }
        if (existingNames.includes(trimmedName) && trimmedName !== specialty?.name) {
            setError('Esta especialidade já existe.');
            return;
        }
        onSave(specialty?.name || null, { name: trimmedName, icon });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (error) setError('');
    }

    const CurrentIcon = getIcon(icon);

    return (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-2 space-y-4 border border-primary dark:border-accent">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-md">
                    <CurrentIcon className="w-8 h-8 text-primary dark:text-accent"/>
                </div>
                <input 
                    type="text" 
                    value={name} 
                    onChange={handleNameChange}
                    placeholder="Nome da Especialidade"
                    className="flex-grow p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                />
                 <button 
                    onClick={() => fetchIconSuggestions(name)} 
                    disabled={isLoading || !name} 
                    className="p-2 bg-secondary text-white rounded-md hover:bg-dark disabled:bg-gray-400 flex items-center"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5"/>}
                 </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
                <h4 className="text-sm font-semibold mb-2">Sugestões de Ícones:</h4>
                {suggestedIcons.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {suggestedIcons.map(iconName => {
                            const IconComp = getIcon(iconName);
                            return (
                                <button key={iconName} onClick={() => setIcon(iconName)} className={`p-2 rounded-md transition-colors ${icon === iconName ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 hover:bg-light'}`}>
                                    <IconComp className="w-6 h-6"/>
                                </button>
                            )
                        })}
                    </div>
                ) : !isLoading && <p className="text-xs text-gray-500">Nenhuma sugestão. Clique na varinha mágica.</p>}
            </div>

            <div className="flex justify-end space-x-2">
                <button onClick={onCancel} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><X className="w-5 h-5"/></button>
                <button onClick={handleSave} className="p-2 rounded-md bg-green-500 text-white hover:bg-green-600"><Check className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

export default SpecialtyEditor;
