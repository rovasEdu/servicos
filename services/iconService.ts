import React from 'react';
import * as icons from 'lucide-react';

const { createReactComponent, ...lucideIcons } = icons; // Remove non-icon exports

// Type assertion for safety
type IconComponent = React.ForwardRefExoticComponent<Omit<icons.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

export const LUCIDE_ICONS: { [key: string]: IconComponent } = lucideIcons as { [key: string]: IconComponent };

export const getIcon = (name: string | undefined): IconComponent => {
    if (name && LUCIDE_ICONS[name]) {
        return LUCIDE_ICONS[name];
    }
    return LUCIDE_ICONS['Construction']; // Fallback icon
};

export const getIconNames = (): string[] => {
    // Filter out any non-component exports if they exist
    return Object.keys(LUCIDE_ICONS).filter(key => typeof LUCIDE_ICONS[key] === 'object');
};
