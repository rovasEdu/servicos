import { useState, useEffect, useCallback } from 'react';
import { Provider } from '../types';

const STORAGE_KEY = 'serviceProvidersDB';

const sanitizeProvider = (p: any): Provider => ({
    id: p.id || `provider-${Date.now()}-${Math.random()}`,
    name: p.name || 'Nome Desconhecido',
    specialties: Array.isArray(p.specialties) ? p.specialties : [],
    contacts: Array.isArray(p.contacts) ? p.contacts : [],
    emails: Array.isArray(p.emails) ? p.emails : [],
    address: p.address || '',
    googleMapsUrl: p.googleMapsUrl || '',
    website: p.website || '',
    socialMedia: typeof p.socialMedia === 'object' && p.socialMedia !== null ? p.socialMedia : {},
    customTags: Array.isArray(p.customTags) ? p.customTags : [],
    review: typeof p.review === 'object' ? p.review : null,
    serviceHistory: Array.isArray(p.serviceHistory) ? p.serviceHistory : [],
    isFavorite: !!p.isFavorite,
});


export const useProviders = () => {
    const [providers, setProviders] = useState<Provider[]>(() => {
        try {
            const storedProviders = localStorage.getItem(STORAGE_KEY);
            const parsed = storedProviders ? JSON.parse(storedProviders) : [];
            
            if (!Array.isArray(parsed)) {
                return [];
            }

            // Sanitize data to prevent crashes from malformed storage data
            return parsed.map(sanitizeProvider);
        } catch (error) {
            console.error("Failed to load or parse providers from localStorage", error);
            // If parsing fails, it's better to start fresh than to crash the app
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
        } catch (error) {
            console.error("Failed to save providers to localStorage", error);
        }
    }, [providers]);

    const addProvider = useCallback((provider: Provider) => {
        setProviders(currentProviders => [...currentProviders, provider]);
    }, []);

    const updateProvider = useCallback((updatedProvider: Provider) => {
        setProviders(currentProviders =>
            currentProviders.map(p =>
                p.id === updatedProvider.id ? updatedProvider : p
            )
        );
    }, []);

    const deleteProvider = useCallback((providerId: string) => {
        setProviders(currentProviders => currentProviders.filter(p => p.id !== providerId));
    }, []);

    const importProviders = useCallback((newProviders: Provider[], mode: 'replace' | 'merge') => {
        const sanitizedNewProviders = newProviders.map(sanitizeProvider);

        if (mode === 'replace') {
            setProviders(sanitizedNewProviders);
            return;
        }
        
        setProviders(currentProviders => {
            const providerMap = new Map(currentProviders.map(p => [p.id, p]));
            sanitizedNewProviders.forEach(np => providerMap.set(np.id, np));
            return Array.from(providerMap.values());
        });
    }, []);
    
    const exportProviders = useCallback(() => {
        return JSON.stringify(providers, null, 2);
    }, [providers]);

    const updateProvidersBySpecialtyRename = useCallback((oldName: string, newName: string) => {
        setProviders(currentProviders =>
            currentProviders.map(p => {
                if (p.specialties.includes(oldName)) {
                    return {
                        ...p,
                        specialties: p.specialties.map(s => s === oldName ? newName : s)
                    };
                }
                return p;
            })
        );
    }, []);

    const removeSpecialtyFromProviders = useCallback((specialtyName: string) => {
        setProviders(currentProviders =>
            currentProviders.map(p => {
                 if (p.specialties.includes(specialtyName)) {
                    return {
                        ...p,
                        specialties: p.specialties.filter(s => s !== specialtyName)
                    };
                 }
                 return p;
            })
        );
    }, []);

    return {
        providers,
        addProvider,
        updateProvider,
        deleteProvider,
        importProviders,
        exportProviders,
        updateProvidersBySpecialtyRename,
        removeSpecialtyFromProviders,
    };
};