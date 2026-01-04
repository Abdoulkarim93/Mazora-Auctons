import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';

export const NotFound = () => {
    const { t } = useApp();
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="text-9xl font-extrabold text-gray-200">404</div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mt-4 mb-2">{t('common.notFoundTitle')}</h1>
            <p className="text-gray-500 max-w-md mb-8">
                {t('common.notFoundDesc')}
            </p>
            <div className="flex gap-4">
                <Link 
                    to="/" 
                    className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-800 transition-colors shadow-lg"
                >
                    {t('common.goHome')}
                </Link>
                <Link 
                    to="/categories" 
                    className="bg-white border border-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    {t('common.browseCats')}
                </Link>
            </div>
        </div>
    );
};