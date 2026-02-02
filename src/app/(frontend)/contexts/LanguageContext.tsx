"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../lib/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  cs: {
    // Auth
    'auth.login': 'Přihlásit se',
    'auth.logout': 'Odhlásit se',
    'auth.email': 'E-mail',
    'auth.password': 'Heslo',
    'auth.forgotPassword': 'Zapomenuté heslo?',
    'auth.resetPassword': 'Obnovit heslo',
    'auth.backToLogin': 'Zpět na přihlášení',
    'auth.sendResetLink': 'Odeslat odkaz pro obnovení',
    'auth.resetSent': 'Odkaz pro obnovení hesla byl odeslán na váš e-mail.',
    'auth.invalidCredentials': 'Nesprávný e-mail nebo heslo',

    // Navigation
    'nav.dashboard': 'Nástěnka',
    'nav.back': 'Zpět',
    'nav.settings': 'Nastavení projektů',
    'nav.projects': 'Projekty',

    // Project Status
    'status.current': 'Aktuální',
    'status.planned': 'Plánovaný',
    'status.completed': 'Dokončený',
    'status.all': 'Zobrazit vše',

    // Sections
    'section.intro': 'Intro',
    'section.location': 'Lokalita',
    'section.model': 'Model projektu',
    'section.units': 'Jednotky',
    'section.gallery': 'Galerie',
    'section.amenities': 'Služby a vybavení',
    'section.standards': 'Podklady',
    'section.timeline': 'Časová osa',

    // Units
    'units.name': 'Název',
    'units.floor': 'Podlaží',
    'units.building': 'Budova',
    'units.size': 'Podlahová plocha',
    'units.disposition': 'Dispozice',
    'units.balcony': 'Balkon/Terasa',
    'units.terrace': 'Předzahrádka',
    'units.orientation': 'Orientace',
    'units.price': 'Cena',
    'units.status': 'Stav',
    'units.available': 'Volné',
    'units.reserved': 'Rezervováno',
    'units.sold': 'Prodáno',
    'units.compare': 'Porovnat',
    'units.compareUnits': 'Porovnat jednotky',
    'units.backToList': 'Zpět na seznam',
    'units.resetFilters': 'Resetovat filtry',
    'units.priceRange': 'Cenové rozpětí',
    'units.yes': 'Ano',
    'units.no': 'Ne',
    'units.sqm': 'm²',

    // Map
    'map.filter': 'Filtrovat',
    'map.allCategories': 'Všechny kategorie',
    'map.details': 'Detaily',
    'map.close': 'Zavřít',
    'map.openLink': 'Otevřít odkaz',
    'map.buildingPlan': 'Plán stavby',

    // 3D Model
    'model.loading': 'Interaktivní 3D model se načítá...',
    'model.zoomIn': 'Přiblížit',
    'model.zoomOut': 'Oddálit',
    'model.rotate': 'Rotovat',
    'model.reset': 'Reset pohledu',
    'model.upload': 'Nahrát model',
    'model.update': 'Aktualizovat model',

    // Gallery
    'gallery.previous': 'Předchozí',
    'gallery.next': 'Další',
    'gallery.close': 'Zavřít',
    'gallery.of': 'z',

    // Timeline
    'timeline.currentPhase': 'Aktuální fáze',
    'timeline.completed': 'Dokončeno',
    'timeline.upcoming': 'Nadcházející',

    // Admin
    'admin.title': 'Administrace',
    'admin.projectSettings': 'Nastavení projektu',
    'admin.save': 'Uložit',
    'admin.cancel': 'Zrušit',
    'admin.delete': 'Smazat',
    'admin.archive': 'Archivovat',
    'admin.add': 'Přidat',
    'admin.edit': 'Upravit',
    'admin.uploadFile': 'Nahrát soubor',
    'admin.dragDrop': 'Přetáhněte soubory sem',
    'admin.or': 'nebo',
    'admin.browse': 'Procházet',
    'admin.required': 'Povinné pole',
    'admin.optional': 'Volitelné',

    // Common
    'common.loading': 'Načítání...',
    'common.error': 'Došlo k chybě',
    'common.noData': 'Žádná data',
    'common.confirm': 'Potvrdit',
    'common.search': 'Hledat',
  },
  en: {
    // Auth
    'auth.login': 'Log in',
    'auth.logout': 'Log out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.resetPassword': 'Reset password',
    'auth.backToLogin': 'Back to login',
    'auth.sendResetLink': 'Send reset link',
    'auth.resetSent': 'Password reset link has been sent to your email.',
    'auth.invalidCredentials': 'Invalid email or password',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.back': 'Back',
    'nav.settings': 'Project Settings',
    'nav.projects': 'Projects',

    // Project Status
    'status.current': 'Current',
    'status.planned': 'Planned',
    'status.completed': 'Completed',
    'status.all': 'Show all',

    // Sections
    'section.intro': 'Intro',
    'section.location': 'Location',
    'section.model': 'Project Model',
    'section.units': 'Units',
    'section.gallery': 'Gallery',
    'section.amenities': 'Services & Amenities',
    'section.standards': 'Documents',
    'section.timeline': 'Timeline',

    // Units
    'units.name': 'Name',
    'units.floor': 'Floor',
    'units.building': 'Building',
    'units.size': 'Floor area',
    'units.disposition': 'Layout',
    'units.balcony': 'Balcony/Terrace',
    'units.terrace': 'Garden',
    'units.orientation': 'Orientation',
    'units.price': 'Price',
    'units.status': 'Status',
    'units.available': 'Available',
    'units.reserved': 'Reserved',
    'units.sold': 'Sold',
    'units.compare': 'Compare',
    'units.compareUnits': 'Compare units',
    'units.backToList': 'Back to list',
    'units.resetFilters': 'Reset filters',
    'units.priceRange': 'Price range',
    'units.yes': 'Yes',
    'units.no': 'No',
    'units.sqm': 'sqm',

    // Map
    'map.filter': 'Filter',
    'map.allCategories': 'All categories',
    'map.details': 'Details',
    'map.close': 'Close',
    'map.openLink': 'Open link',
    'map.buildingPlan': 'Building plan',

    // 3D Model
    'model.loading': 'Loading interactive 3D model...',
    'model.zoomIn': 'Zoom in',
    'model.zoomOut': 'Zoom out',
    'model.rotate': 'Rotate',
    'model.reset': 'Reset view',
    'model.upload': 'Upload model',
    'model.update': 'Update model',

    // Gallery
    'gallery.previous': 'Previous',
    'gallery.next': 'Next',
    'gallery.close': 'Close',
    'gallery.of': 'of',

    // Timeline
    'timeline.currentPhase': 'Current phase',
    'timeline.completed': 'Completed',
    'timeline.upcoming': 'Upcoming',

    // Admin
    'admin.title': 'Administration',
    'admin.projectSettings': 'Project Settings',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.delete': 'Delete',
    'admin.archive': 'Archive',
    'admin.add': 'Add',
    'admin.edit': 'Edit',
    'admin.uploadFile': 'Upload file',
    'admin.dragDrop': 'Drag and drop files here',
    'admin.or': 'or',
    'admin.browse': 'Browse',
    'admin.required': 'Required',
    'admin.optional': 'Optional',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.noData': 'No data',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('cs');

  useEffect(() => {
    const stored = localStorage.getItem('daramis_language') as Language | null;
    if (stored && (stored === 'cs' || stored === 'en')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('daramis_language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
