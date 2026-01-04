
import React from 'react';
import { Link } from 'react-router-dom';

// Embedded Logo SVG (Blue Square, Gold Gear, Gavel, Arrow)
export const MAZORA_LOGO_SVG = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%230e2a5c'/%3E%3Ccircle cx='250' cy='250' r='190' stroke='%23cca458' stroke-width='15' fill='none'/%3E%3Ccircle cx='250' cy='250' r='165' stroke='%23cca458' stroke-width='4' fill='none'/%3E%3Cpath d='M170 310 V180 L250 260 L330 180 V310' stroke='white' stroke-width='35' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Crect x='210' y='110' width='80' height='50' rx='8' fill='%23cca458' transform='rotate(-45 250 135)'/%3E%3Cpath d='M330 180 L390 120 M390 120 L340 120 M390 120 L390 170' stroke='%23cca458' stroke-width='15' stroke-linecap='round' fill='none'/%3E%3Ctext x='250' y='410' text-anchor='middle' font-family='Arial, sans-serif' font-weight='900' font-size='65' fill='white'%3EMAZORA%3C/text%3E%3Ctext x='250' y='460' text-anchor='middle' font-family='Arial, sans-serif' font-weight='bold' font-size='26' fill='white' letter-spacing='5'%3EAUCTIONS%3C/text%3E%3C/svg%3E`;

interface LogoProps {
    className?: string;
    linked?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", linked = true }) => {
    const img = (
        <img 
            src={MAZORA_LOGO_SVG} 
            alt="Mazora" 
            className={`${className} object-contain rounded-xl shadow-sm`} 
        />
    );

    if (linked) {
        return <Link to="/" className="inline-block hover:opacity-90 transition-opacity">{img}</Link>;
    }
    return img;
};
