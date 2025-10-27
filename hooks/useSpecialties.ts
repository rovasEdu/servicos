import { useState, useEffect, useCallback } from 'react';
import { SpecialtyConfig } from '../types';

const STORAGE_KEY = 'serviceSpecialtiesDB';

const INITIAL_SPECIALTIES: SpecialtyConfig[] = [
    { name: "Pintor", icon: "Paintbrush" },
    { name: "Pedreiro", icon: "HardHat" },
    { name: "Marceneiro", icon: "Hammer" },
    { name: "Carpinteiro", icon: "Hammer" },
    { name: "Metalúrgico", icon: "Drill" },
    { name: "Soldador", icon: "Drill" },
    { name: "Bombeiro", icon: "UserCheck" },
    { name: "Gesseiro", icon: "Layers" },
    { name: "Retelhamento", icon: "Building" },
    { name: "Ar Condicionado", icon: "Wind" },
    { name: "Eletricista", icon: "Zap" },
    { name: "Engenheiro Eletricista", icon: "UserCheck" },
    { name: "Engenheiro de Gás", icon: "UserCheck" },
    { name: "Engenheiro Civil", icon: "UserCheck" },
    { name: "Niquelador", icon: "Gem" },
    { name: "Segurança Eletrônica", icon: "ShieldCheck" },
    { name: "Câmeras de Vigilância", icon: "Tv" },
    { name: "Piso vinílico", icon: "Layers" },
    { name: "Piso cerâmica", icon: "Layers" },
    { name: "Porcelanato líquido", icon: "Layers" },
    { name: "Steel Frame", icon: "Building" },
    { name: "Revestimento de pedra", icon: "Gem" },
    { name: "Lona tensionada", icon: "VenetianMask" },
    { name: "Lustres", icon: "Lightbulb" },
    { name: "Automação residencial", icon: "Bot" },
];

export const useSpecialties = () => {
    const [specialties, setSpecialties] = useState<SpecialtyConfig[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            // Se não houver nada salvo, usa a lista inicial.
            return stored ? JSON.parse(stored) : INITIAL_SPECIALTIES;
        } catch (error) {
            console.error("Failed to load specialties from localStorage", error);
            return INITIAL_SPECIALTIES;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(specialties));
        } catch (error) {
            console.error("Failed to save specialties to localStorage", error);
        }
    }, [specialties]);

    const addSpecialty = useCallback((specialty: SpecialtyConfig) => {
        setSpecialties(current => [...current, specialty]);
    }, []);

    const updateSpecialty = useCallback((oldName: string, newSpecialty: SpecialtyConfig) => {
        setSpecialties(current =>
            current.map(s => (s.name === oldName ? newSpecialty : s))
        );
    }, []);

    const deleteSpecialty = useCallback((name: string) => {
        setSpecialties(current => current.filter(s => s.name !== name));
    }, []);

    return {
        specialties,
        addSpecialty,
        updateSpecialty,
        deleteSpecialty,
    };
};