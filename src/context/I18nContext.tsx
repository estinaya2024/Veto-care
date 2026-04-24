import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
type Language = 'fr' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.dashboard': 'Tableau de Bord',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'hero.title': 'Soins d\'Excellence pour vos Compagnons',
    'hero.subtitle': 'L\'extranet vétérinaire nouvelle génération : simple, rapide et sécurisé.',
    'hero.cta': 'Prendre Rendez-vous',
    'dash.welcome': 'Bienvenue',
    'dash.pets': 'Mes Animaux',
    'dash.agenda': 'Agenda',
    'dash.team': 'L\'Équipe',
    'dash.add_pet': '+ Ajouter un animal',
    'dash.no_pets': 'Aucun compagnon enregistré',
    'dash.next_apt': 'Prochain Rendez-vous',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement...',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.title': 'Excellence in Care for Your Companions',
    'hero.subtitle': 'Next-gen veterinary extranet: simple, fast, and secure.',
    'hero.cta': 'Book an Appointment',
    'dash.welcome': 'Welcome',
    'dash.pets': 'My Pets',
    'dash.agenda': 'Schedule',
    'dash.team': 'The Team',
    'dash.add_pet': '+ Add a pet',
    'dash.no_pets': 'No pets registered',
    'dash.next_apt': 'Next Appointment',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
