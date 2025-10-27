import React, { useState, useMemo } from 'react';
import { useProviders } from './hooks/useProviders';
import { useSpecialties } from './hooks/useSpecialties';
import { Provider, Specialty, View, SpecialtyConfig, Review } from './types';
import { getIcon } from './services/iconService';
import ProviderList from './components/ProviderList';
import ProviderDetail from './components/ProviderDetail';
import ProviderForm from './components/ProviderForm';
import Settings from './components/Settings';
import OCRProcessor from './components/OCRProcessor';
import SpecialtyEditor from './components/SpecialtyEditor';
import { Plus, Settings as SettingsIcon, Home, ChevronDown, ChevronUp, Edit, X as XIcon, Search as SearchIcon, Star, Trash2, ChevronLeft } from 'lucide-react';
import { reviewNumericFields } from './constants';

const calculateAverageRating = (review: Review | null): number => {
    if (!review) {
        return 0;
    }
    const ratings = reviewNumericFields.map(field => review[field]);
    if (ratings.length === 0) return 0;
    
    const total = ratings.reduce((sum, rating) => sum + (rating || 0), 0);
    const average = total / ratings.length;

    return average;
};

interface SearchProps {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  onBack: () => void;
  onEditProvider: (provider: Provider) => void;
  onDeleteProvider: (id: string) => void;
}

const Search: React.FC<SearchProps> = ({ providers, onSelectProvider, onBack, onEditProvider, onDeleteProvider }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return providers.filter(provider => {
      const check = (str: string) => str.toLowerCase().includes(lowercasedTerm);
      const checkArray = (arr: string[]) => arr.some(item => item.toLowerCase().includes(lowercasedTerm));

      return (
        check(provider.name) ||
        check(provider.address) ||
        checkArray(provider.specialties) ||
        checkArray(provider.customTags) ||
        provider.contacts.some(c => check(c.value)) ||
        provider.emails.some(e => check(e.value))
      );
    });
  }, [searchTerm, providers]);

  return (
    <div className="p-4">
      <div className="relative flex items-center justify-center mb-6">
        <button onClick={onBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft className="w-6 h-6 text-primary dark:text-accent" />
        </button>
        <h1 className="text-base font-bold text-primary dark:text-accent uppercase text-center">Buscar</h1>
      </div>
      
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, tag, especialidade..."
          className="w-full p-3 pl-10 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {searchTerm.trim() && (
        <div>
          {filteredProviders.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Nenhum prestador encontrado.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">{filteredProviders.length} resultado(s) encontrado(s)</p>
              {filteredProviders.sort((a,b) => a.name.localeCompare(b.name)).map(provider => {
                const averageRating = calculateAverageRating(provider.review);

                const getRatingColorClass = (rating: number): string => {
                    if (rating === 0) return '';
                    if (rating >= 4) return 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400';
                    if (rating <= 2) return 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400';
                    return '';
                };
                const ratingColorClass = getRatingColorClass(averageRating);
                
                return (
                <div
                  key={provider.id}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all ${ratingColorClass}`}
                >
                  <div onClick={() => onSelectProvider(provider)} className="flex-grow flex items-center min-w-0">
                    <div className="flex-grow min-w-0">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">{provider.name}</h2>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {averageRating > 0 ? (
                                <div className="flex items-center mr-2 pr-2 border-r border-gray-300 dark:border-gray-600 flex-shrink-0">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                                </div>
                            ) : null}
                            <p className="truncate">{provider.specialties.join(', ')}</p>
                        </div>
                    </div>
                    {provider.isFavorite && <Star className="w-5 h-5 text-yellow-400 fill-current ml-4 flex-shrink-0" />}
                  </div>
                   <div className="flex items-center flex-shrink-0 ml-4">
                     <button onClick={(e) => { e.stopPropagation(); onEditProvider(provider); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Edit className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProvider(provider.id); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Trash2 className="w-5 h-5 text-red-500"/>
                    </button>
                   </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const App: React.FC = () => {
    const { providers, addProvider, updateProvider, deleteProvider, importProviders, exportProviders, updateProvidersBySpecialtyRename, removeSpecialtyFromProviders } = useProviders();
    const { specialties, addSpecialty, updateSpecialty, deleteSpecialty } = useSpecialties();
    const [view, setView] = useState<View>({ type: 'home' });
    const [showEmptySpecialties, setShowEmptySpecialties] = useState(false);
    const [isManagingSpecialties, setIsManagingSpecialties] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyConfig | 'new' | null>(null);

    const providersBySpecialty = useMemo(() => {
        const map = new Map<Specialty, Provider[]>();
        specialties.forEach(s => map.set(s.name, []));
        providers.forEach(p => {
            p.specialties.forEach(spec => {
                if (map.has(spec)) {
                    map.get(spec)!.push(p);
                } else {
                    if(!map.has(spec)){
                        map.set(spec, []);
                    }
                    map.get(spec)!.push(p);
                }
            });
        });
        return map;
    }, [providers, specialties]);

    const sortedSpecialtiesConfigs = useMemo(() => {
        return [...specialties].sort((a, b) => a.name.localeCompare(b.name));
    }, [specialties]);

    const handleSelectSpecialty = (specialty: Specialty) => {
        setView({ type: 'list', specialty });
    };

    const handleSelectProvider = (provider: Provider) => {
        setView({ type: 'detail', provider });
    };

    const handleBack = () => {
        if (view.type === 'detail') {
            const specialtyName = view.provider.specialties[0] || (sortedSpecialtiesConfigs.length > 0 ? sortedSpecialtiesConfigs[0].name : '');
            if(specialtyName){
                 setView({ type: 'list', specialty: specialtyName });
            } else {
                setView({type: 'home'});
            }
        } else if (view.type === 'list' || view.type === 'form' || view.type === 'settings' || view.type === 'ocr' || view.type === 'search') {
            setView({ type: 'home' });
        }
    };
    
    const onProviderSaved = (provider: Provider) => {
        if (providers.some(p => p.id === provider.id)) {
            updateProvider(provider);
        } else {
            addProvider(provider);
        }
        setView({ type: 'detail', provider });
    };

    const handleDeleteProvider = (id: string) => {
        if(confirm('Tem certeza que deseja remover este prestador?')) {
            deleteProvider(id);
            if(view.type === 'detail' || view.type === 'list' || view.type === 'search'){
                setView({type: 'home'});
            }
        }
    }

    // --- Specialty Management Handlers ---
    const handleAddSpecialty = (newSpecialty: SpecialtyConfig) => {
        addSpecialty(newSpecialty);
    };

    const handleUpdateSpecialty = (oldName: string, newSpecialty: SpecialtyConfig) => {
        updateSpecialty(oldName, newSpecialty);
        if (oldName !== newSpecialty.name) {
            updateProvidersBySpecialtyRename(oldName, newSpecialty.name);
        }
    };

    const handleDeleteSpecialty = (specialtyName: string) => {
        if (confirm(`Tem certeza que deseja remover a especialidade "${specialtyName}"? Ela será removida de todos os prestadores associados.`)) {
            deleteSpecialty(specialtyName);
            removeSpecialtyFromProviders(specialtyName);
        }
    };
    
    const handleSaveSpecialty = (oldName: string | null, newSpecialty: SpecialtyConfig) => {
        if (oldName) {
            handleUpdateSpecialty(oldName, newSpecialty);
        } else {
            handleAddSpecialty(newSpecialty);
        }
        setEditingSpecialty(null);
    };


    const renderView = () => {
        switch (view.type) {
            case 'home':
                const visibleSpecialties = showEmptySpecialties ? sortedSpecialtiesConfigs : sortedSpecialtiesConfigs.filter(s => (providersBySpecialty.get(s.name) || []).length > 0);
                const existingSpecialtyNames = specialties.map(s => s.name);
                return (
                    <div className="p-4">
                        <h1 className="text-base font-bold text-primary dark:text-accent mb-6 text-center uppercase">Especialidades</h1>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {visibleSpecialties.map(specialtyConfig => {
                                const Icon = getIcon(specialtyConfig.icon);
                                const providerCount = (providersBySpecialty.get(specialtyConfig.name) || []).length;
                                return (
                                    <div key={specialtyConfig.name} className="relative">
                                        <button
                                            onClick={() => isManagingSpecialties ? setEditingSpecialty(specialtyConfig) : handleSelectSpecialty(specialtyConfig.name)}
                                            className="w-full h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-light dark:hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={editingSpecialty !== null}
                                        >
                                            <Icon className="w-12 h-12 text-secondary dark:text-accent mb-2" />
                                            <span className="text-center font-semibold text-gray-800 dark:text-gray-200">{specialtyConfig.name}</span>
                                             <span className="text-xs text-gray-500 dark:text-gray-400">({providerCount})</span>
                                        </button>
                                         {isManagingSpecialties && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSpecialty(specialtyConfig.name); }}
                                                className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                                aria-label={`Remover ${specialtyConfig.name}`}
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 text-center flex justify-center items-center space-x-4">
                             <button 
                                onClick={() => {
                                    const nextShow = !showEmptySpecialties;
                                    setShowEmptySpecialties(nextShow);
                                    if (!nextShow) {
                                        setIsManagingSpecialties(false);
                                        setEditingSpecialty(null);
                                    }
                                }}
                                className="inline-flex items-center text-secondary dark:text-accent hover:underline"
                            >
                                {showEmptySpecialties ? 'Ocultar vazias' : 'Mostrar todas as especialidades'}
                                {showEmptySpecialties ? <ChevronUp className="ml-2 h-4 w-4"/> : <ChevronDown className="ml-2 h-4 w-4"/>}
                            </button>

                            {showEmptySpecialties && (
                                <button 
                                    onClick={() => setIsManagingSpecialties(!isManagingSpecialties)}
                                    className={`p-2 rounded-full transition-colors ${isManagingSpecialties ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    aria-label="Gerenciar especialidades"
                                >
                                    <Edit className="h-5 w-5"/>
                                </button>
                            )}
                        </div>

                        {showEmptySpecialties && isManagingSpecialties && (
                             <div className="mt-6 flex justify-center">
                                 <button onClick={() => setEditingSpecialty('new')} className="w-full max-w-xs flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                     <Plus className="w-5 h-5 mr-2" />
                                     Adicionar Nova Especialidade
                                 </button>
                             </div>
                        )}
                        
                        {editingSpecialty !== null && (
                            <div className="mt-8">
                                <h2 className="text-sm font-bold text-primary dark:text-accent mb-4 text-center uppercase">
                                    {editingSpecialty === 'new' ? 'Nova Especialidade' : 'Editar Especialidade'}
                                </h2>
                                <SpecialtyEditor
                                    specialty={editingSpecialty === 'new' ? null : editingSpecialty}
                                    onSave={handleSaveSpecialty}
                                    onCancel={() => setEditingSpecialty(null)}
                                    existingNames={existingSpecialtyNames}
                                />
                            </div>
                        )}
                    </div>
                );
            case 'list':
                return <ProviderList
                    specialty={view.specialty}
                    providers={providersBySpecialty.get(view.specialty) || []}
                    onSelectProvider={handleSelectProvider}
                    onEditProvider={(provider) => setView({type: 'form', provider})}
                    onDeleteProvider={handleDeleteProvider}
                    onBack={handleBack}
                />;
            case 'detail':
                return <ProviderDetail
                    provider={view.provider}
                    onBack={handleBack}
                    onEdit={() => setView({ type: 'form', provider: view.provider })}
                    onDelete={handleDeleteProvider}
                />;
            case 'form':
                return <ProviderForm
                    provider={view.provider}
                    specialties={sortedSpecialtiesConfigs}
                    onSave={onProviderSaved}
                    onCancel={handleBack}
                />;
            case 'settings':
                return <Settings 
                    onImport={importProviders} 
                    onExport={exportProviders} 
                    onBack={handleBack}
                />;
            case 'ocr':
                const allSpecialtyNames = specialties.map(s => s.name);
                return <OCRProcessor 
                    onBack={handleBack} 
                    onProcess={(ocrProviders) => {
                        const newProviders = ocrProviders.map(p => ({
                            ...p, 
                            id: `provider-${Date.now()}-${Math.random()}`,
                            review: null,
                            serviceHistory: [],
                            isFavorite: false,
                        }));
                        newProviders.forEach(addProvider);
                        setView({ type: 'home' });
                    }} 
                    availableSpecialties={allSpecialtyNames}
                />;
            case 'search':
                return <Search
                    providers={providers}
                    onSelectProvider={handleSelectProvider}
                    onBack={handleBack}
                    onEditProvider={(provider) => setView({type: 'form', provider})}
                    onDeleteProvider={handleDeleteProvider}
                />;
            default:
                return <div>Página não encontrada</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <main className="pb-20 max-w-4xl mx-auto">
                {renderView()}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
                    <button onClick={() => setView({ type: 'home' })} className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors">
                        <Home className="w-6 h-6" />
                        <span className="text-xs">Início</span>
                    </button>
                     <button onClick={() => setView({ type: 'ocr' })} className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan-text"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/><path d="M7 12h10"/><path d="M10 7h4"/><path d="M10 17h4"/></svg>
                        <span className="text-xs">OCR</span>
                    </button>
                    <button onClick={() => setView({ type: 'form', provider: null })} className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors">
                        <Plus className="w-6 h-6" />
                        <span className="text-xs">Adicionar</span>
                    </button>
                    <button onClick={() => setView({ type: 'settings' })} className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors">
                        <SettingsIcon className="w-6 h-6" />
                        <span className="text-xs">Ajustes</span>
                    </button>
                     <button onClick={() => setView({ type: 'search' })} className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors">
                        <SearchIcon className="w-6 h-6" />
                        <span className="text-xs">Buscar</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default App;