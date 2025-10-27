import React from 'react';
import { Provider, Specialty, Review } from '../types';
import { Star, ChevronLeft, Edit, Trash2 } from 'lucide-react';
import { reviewNumericFields } from '../constants';

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

interface ProviderListProps {
  specialty: Specialty;
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  onEditProvider: (provider: Provider) => void;
  onDeleteProvider: (id: string) => void;
  onBack: () => void;
}

const ProviderList: React.FC<ProviderListProps> = ({ specialty, providers, onSelectProvider, onEditProvider, onDeleteProvider, onBack }) => {
  return (
    <div className="p-4">
      <div className="relative flex items-center justify-center mb-6">
        <button onClick={onBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft className="w-6 h-6 text-primary dark:text-accent" />
        </button>
        <h1 className="text-base font-bold text-primary dark:text-accent uppercase text-center">{specialty}</h1>
      </div>
      {providers.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Nenhum prestador encontrado para esta especialidade.</p>
      ) : (
        <div className="space-y-4">
          {providers.sort((a,b) => a.name.localeCompare(b.name)).map(provider => {
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
                      <p className="truncate">{provider.address}</p>
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
  );
};

export default ProviderList;