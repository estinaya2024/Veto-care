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
    // ── Navbar ──
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Tableau de Bord',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'nav.install_app': "Installer l'App",

    // ── Hero ──
    'hero.title': 'Votre animal\nnotre priorité',
    'hero.subtitle': "L'extranet vétérinaire nouvelle génération : simple, rapide et sécurisé.",
    'hero.cta': 'Prendre Rendez-vous',
    'hero.services_banner_title': 'Dog Walking & Pet Sitting Services',
    'hero.services_banner_location': 'À travers Béjaïa, Algérie',

    // ── Services ──
    'services.heading': 'Nous excellons en :',
    'services.vaccinations': 'Vaccinations',
    'services.medical_record': 'Dossier Médical',
    'services.vet_visits': 'Visites Vétos',
    'services.prescriptions': 'Ordonnances',
    'services.appointments': 'Rendez-vous',
    'services.pet_profile': 'Profil Animal',

    // ── WhyRelyOnUs ──
    'why.heading': 'Pourquoi nous choisir ?',
    'why.reason1.title': 'Passion Médicale',
    'why.reason1.desc': "Nous considérons chaque animal comme un membre précieux de votre famille nécessitant des soins irréprochables avec toute l'attention médicale qu'il mérite.",
    'why.reason2.title': "Tranquillité d'esprit",
    'why.reason2.desc': "Des normes d'hygiène strictes pour garantir un environnement serein, où votre compagnon reçoit les meilleurs traitements sans stress prolongé.",
    'why.reason3.title': 'Consultations Flexibles',
    'why.reason3.desc': "En plus de nos plages horaires pratiques, nous vous proposons une prise de rendez-vous rapide via notre portail en ligne pour s'adapter à votre quotidien.",
    'why.reason4.title': 'Transparence Totale',
    'why.reason4.desc': "Nous prenons le temps de vous expliquer nos diagnostics et procédures cliniques pour vous accompagner sereinement dans les décisions de santé.",
    'why.reason5.title': 'Prise en charge locale',
    'why.reason5.desc': "Basés à Béjaïa, nous assurons des soins personnalisés et de proximité, bâtissant une relation de confiance durable avec nos patients du quartier.",
    'why.reason6.title': 'Urgences & Suivi',
    'why.reason6.desc': "Notre équipe est préparée pour la gestion de toute pathologie, garantissant à la fois un rétablissement optimal et un suivi digitalisé (carnet de santé).",

    // ── Footer ──
    'footer.tagline': 'Services Professionnels de Soins pour Animaux',
    'footer.location': 'Béjaïa, Algérie',
    'footer.menu': 'Menu',
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.cta_heading': 'Prêt à commencer ?',
    'footer.cta_button': 'Prendre RDV',
    'footer.rights': 'VETOMEDICAL. Tous droits réservés.',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',

    // ── Login Page ──
    'login.back': "Retourner à l'accueil",
    'login.welcome': 'Bon retour !',
    'login.welcome_subtitle': 'Veuillez vous connecter à votre espace.',
    'login.signup': 'Créer un compte',
    'login.signup_subtitle': 'Rejoignez la Clinique Veto-Care.',
    'login.full_name': 'Nom complet',
    'login.email': 'Email',
    'login.password': 'Mot de passe',
    'login.submit_login': 'Se connecter',
    'login.submit_signup': "S'inscrire",
    'login.or': 'Ou continuer avec',
    'login.no_account': "Pas encore de compte ? S'inscrire",
    'login.has_account': 'Déjà un compte ? Se connecter',
    'login.loading': 'Chargement...',
    'login.error_generic': 'Une erreur est survenue',

    // ── About Page ──
    'about.title': 'À Propos de',
    'about.subtitle': 'Notre clinique vétérinaire située à Béjaïa est dédiée à la santé, au bien-être et au bonheur de vos compagnons à quatre pattes.',
    'about.passion_title': 'Une passion pour la médecine vétérinaire',
    'about.passion_body': "Fondée avec l'objectif d'offrir des soins d'excellence, la clinique combine une technologie vétérinaire de pointe avec une philosophie profondément humaine. Nous pensons que chaque animal mérite une attention personnalisée dans un environnement chaleureux, apaisant et sécurisant.",
    'about.feature1': 'Équipement de diagnostic moderne',
    'about.feature2': 'Bloc chirurgical stérile de dernière génération',
    'about.feature3': "Chambres d'hospitalisation confortables",
    'about.feature4': 'Suivi digitalisé complet de chaque patient',
    'about.card1_title': 'Expertise Clinique',
    'about.card1_desc': "Des années d'expérience consolidée en médecine interne, dermatologie et chirurgie spécifique.",
    'about.card2_title': 'Disponibilité',
    'about.card2_desc': "Des rendez-vous adaptés à votre emploi du temps et des canaux dédiés pour les suivis post-opératoires.",
    'about.card3_title': 'Qualité Certifiée',
    'about.card3_desc': "Des standards stricts d'hygiène et de sécurité protocolaire appliqués pour chaque intervention.",

    // ── Owner Dashboard ──
    'dash.welcome': 'Bienvenue',
    'dash.pets': 'Mes Animaux',
    'dash.agenda': 'Agenda',
    'dash.team': "L'Équipe",
    'dash.add_pet': '+ Ajouter un animal',
    'dash.no_pets': 'Aucun compagnon enregistré',
    'dash.next_apt': 'Prochain Rendez-vous',
    'dash.book_now': 'Réserver maintenant',
    'dash.health_record': 'Carnet de Santé',
    'dash.settings': 'Paramètres',
    'dash.logout': 'Déconnexion',
    'dash.tab.appointments': 'Rendez-vous',
    'dash.tab.calendar': 'Calendrier',
    'dash.tab.health': 'Carnet de Santé',
    'dash.tab.ai': 'Assistant IA',

    // ── Owner Dashboard ──
    'owner.subtitle': 'Gérez la santé de vos compagnons en toute sérénité.',
    'owner.tab.overview': 'Mes Animaux',
    'owner.tab.appointments': 'Agenda',
    'owner.tab.history': 'Historique',
    'owner.stat.pets': 'Vos Pets',
    'owner.stat.upcoming': 'RDV Prévus',
    'owner.stat.health': 'Status Santé',
    'owner.stat.health_val': 'Excellent',
    'owner.companions': 'Vos Compagnons',
    'owner.add_pet_btn': 'Ajouter un animal',
    'owner.breed_unknown': 'Race non précisée',
    'owner.pet_status': 'Statut',
    'owner.pet_weight': 'Poids',
    'owner.view_record': 'Consulter Dossier',
    'owner.medical_agenda': 'Agenda Médical',
    'owner.book_apt': 'Prendre RDV',
    'owner.no_upcoming': 'Aucun rendez-vous à venir.',
    'owner.awaiting': 'En attente de confirmation',
    'owner.confirmed': 'Confirmé',
    'owner.arrived': 'Je suis arrivé',
    'owner.waiting_room': "En salle d'attente",
    'owner.global_history': 'Historique Médical Global',
    'owner.no_history': 'Aucun historique disponible.',
    'owner.col.date': 'Date',
    'owner.col.animal': 'Animal',
    'owner.col.type': 'Type',
    'owner.col.status': 'Statut',
    'owner.consultation': 'Consultation',
    'owner.add_modal_title': 'Ajouter un Animal',
    'owner.field.pet_name': "Nom de l'animal *",
    'owner.field.species': 'Espèce *',
    'owner.field.breed': 'Race (Optionnel)',
    'owner.field.weight': 'Poids (kg)',
    'owner.species.dog': 'Chien',
    'owner.species.cat': 'Chat',
    'owner.species.bird': 'Oiseau',
    'owner.species.rodent': 'Rongeur',
    'owner.species.reptile': 'Reptile',
    'owner.species.other': 'Autre',
    'owner.save_pet': 'Ajouter le dossier',
    'owner.saving_pet': 'Enregistrement...',
    'owner.back': 'Retour',
    'owner.book_heading': 'Prendre Rendez-vous',

    // ── Sidebar ──
    'sidebar.dashboard': 'Dashboard',
    'sidebar.owners': 'Maîtres',
    'sidebar.vets': 'Vétérinaires',
    'sidebar.appointments': 'Rendez-vous',
    'sidebar.settings': 'Mon Compte',
    'sidebar.logout': 'Se Déconnecter',

    // ── Settings ──
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez vos informations personnelles et préférences.',
    'settings.role.vet': 'Vétérinaire',
    'settings.role.owner': 'Propriétaire',
    'settings.field.fullname': 'Nom Complet',
    'settings.field.phone': 'Numéro de téléphone',
    'settings.field.email': 'Adresse Email',
    'settings.secure': 'Données sécurisées',
    'settings.save': 'Sauvegarder',
    'settings.saving': 'Enregistrement...',

    // ── AI Symptom Checker ──
    'ai.title': 'Assistant Santé IA',
    'ai.online': 'En ligne',
    'ai.welcome': "Bonjour ! Je suis l'assistant IA de VetoCare. Je peux évaluer les symptômes de votre animal ou vous guider sur notre site. Comment puis-je vous aider aujourd'hui ?",
    'ai.placeholder': 'Décrivez les symptômes...',
    'ai.book_btn': 'Prendre un Rendez-vous',
    'ai.tooltip': 'Assistant IA',
    'ai.error': "Désolé, il y a eu un problème de connexion avec l'IA. Veuillez réessayer plus tard ou prendre rendez-vous directement.",
    'ai.no_reply': "Je suis désolé, je n'ai pas pu analyser ces symptômes.",

    // ── Common ──
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement...',
    'common.confirm': 'Confirmer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.error': 'Une erreur est survenue.',
    'common.success': 'Succès !',
  },

  en: {
    // ── Navbar ──
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.install_app': 'Install App',

    // ── Hero ──
    'hero.title': 'Your pet\nour priority',
    'hero.subtitle': 'Next-gen veterinary extranet: simple, fast, and secure.',
    'hero.cta': 'Book an Appointment',
    'hero.services_banner_title': 'Dog Walking & Pet Sitting Services',
    'hero.services_banner_location': 'Across Béjaïa, Algeria',

    // ── Services ──
    'services.heading': 'We excel at:',
    'services.vaccinations': 'Vaccinations',
    'services.medical_record': 'Medical Records',
    'services.vet_visits': 'Vet Visits',
    'services.prescriptions': 'Prescriptions',
    'services.appointments': 'Appointments',
    'services.pet_profile': 'Pet Profile',

    // ── WhyRelyOnUs ──
    'why.heading': 'Why choose us?',
    'why.reason1.title': 'Medical Passion',
    'why.reason1.desc': 'We consider every animal a precious member of your family, deserving impeccable care with all the medical attention they merit.',
    'why.reason2.title': 'Peace of Mind',
    'why.reason2.desc': 'Strict hygiene standards to guarantee a serene environment where your companion receives the best treatments without prolonged stress.',
    'why.reason3.title': 'Flexible Consultations',
    'why.reason3.desc': 'In addition to our convenient time slots, we offer fast appointment booking via our online portal to fit your daily schedule.',
    'why.reason4.title': 'Full Transparency',
    'why.reason4.desc': 'We take time to explain our diagnoses and clinical procedures to guide you confidently through health decisions.',
    'why.reason5.title': 'Local Care',
    'why.reason5.desc': 'Based in Béjaïa, we provide personalized and close-proximity care, building a lasting trust with our neighborhood patients.',
    'why.reason6.title': 'Emergencies & Follow-up',
    'why.reason6.desc': 'Our team is prepared to handle any pathology, ensuring optimal recovery and digitized follow-up (health booklet).',

    // ── Footer ──
    'footer.tagline': 'Professional Animal Care Services',
    'footer.location': 'Béjaïa, Algeria',
    'footer.menu': 'Menu',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.cta_heading': 'Ready to start?',
    'footer.cta_button': 'Book an Appointment',
    'footer.rights': 'VETOMEDICAL. All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // ── Login Page ──
    'login.back': 'Return to homepage',
    'login.welcome': 'Welcome back!',
    'login.welcome_subtitle': 'Please sign in to your account.',
    'login.signup': 'Create an account',
    'login.signup_subtitle': 'Join the Veto-Care Clinic.',
    'login.full_name': 'Full name',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit_login': 'Sign in',
    'login.submit_signup': 'Sign up',
    'login.or': 'Or continue with',
    'login.no_account': "Don't have an account? Sign up",
    'login.has_account': 'Already have an account? Sign in',
    'login.loading': 'Loading...',
    'login.error_generic': 'An error occurred',

    // ── About Page ──
    'about.title': 'About',
    'about.subtitle': 'Our veterinary clinic located in Béjaïa is dedicated to the health, well-being, and happiness of your four-legged companions.',
    'about.passion_title': 'A passion for veterinary medicine',
    'about.passion_body': 'Founded with the goal of providing excellence in care, the clinic combines cutting-edge veterinary technology with a deeply human philosophy. We believe every animal deserves personalized attention in a warm, soothing, and safe environment.',
    'about.feature1': 'Modern diagnostic equipment',
    'about.feature2': 'State-of-the-art sterile surgical suite',
    'about.feature3': 'Comfortable hospitalization rooms',
    'about.feature4': 'Complete digitized tracking for every patient',
    'about.card1_title': 'Clinical Expertise',
    'about.card1_desc': 'Years of consolidated experience in internal medicine, dermatology, and specialized surgery.',
    'about.card2_title': 'Availability',
    'about.card2_desc': 'Appointments tailored to your schedule and dedicated channels for post-operative follow-ups.',
    'about.card3_title': 'Certified Quality',
    'about.card3_desc': 'Strict hygiene and protocol safety standards applied for every intervention.',

    // ── Owner Dashboard ──
    'dash.welcome': 'Welcome',
    'dash.pets': 'My Pets',
    'dash.agenda': 'Schedule',
    'dash.team': 'The Team',
    'dash.add_pet': '+ Add a Pet',
    'dash.no_pets': 'No pets registered',
    'dash.next_apt': 'Next Appointment',
    'dash.book_now': 'Book now',
    'dash.health_record': 'Health Record',
    'dash.settings': 'Settings',
    'dash.logout': 'Logout',
    'dash.tab.appointments': 'Appointments',
    'dash.tab.calendar': 'Calendar',
    'dash.tab.health': 'Health Record',
    'dash.tab.ai': 'AI Assistant',

    // ── Owner Dashboard ──
    'owner.subtitle': 'Manage your companions\' health with peace of mind.',
    'owner.tab.overview': 'My Pets',
    'owner.tab.appointments': 'Schedule',
    'owner.tab.history': 'History',
    'owner.stat.pets': 'Your Pets',
    'owner.stat.upcoming': 'Upcoming Appts',
    'owner.stat.health': 'Health Status',
    'owner.stat.health_val': 'Excellent',
    'owner.companions': 'Your Companions',
    'owner.add_pet_btn': 'Add a pet',
    'owner.breed_unknown': 'Breed unspecified',
    'owner.pet_status': 'Status',
    'owner.pet_weight': 'Weight',
    'owner.view_record': 'View Record',
    'owner.medical_agenda': 'Medical Schedule',
    'owner.book_apt': 'Book Appointment',
    'owner.no_upcoming': 'No upcoming appointments.',
    'owner.awaiting': 'Awaiting confirmation',
    'owner.confirmed': 'Confirmed',
    'owner.arrived': 'I have arrived',
    'owner.waiting_room': 'In waiting room',
    'owner.global_history': 'Full Medical History',
    'owner.no_history': 'No history available.',
    'owner.col.date': 'Date',
    'owner.col.animal': 'Animal',
    'owner.col.type': 'Type',
    'owner.col.status': 'Status',
    'owner.consultation': 'Consultation',
    'owner.add_modal_title': 'Add a Pet',
    'owner.field.pet_name': 'Pet name *',
    'owner.field.species': 'Species *',
    'owner.field.breed': 'Breed (Optional)',
    'owner.field.weight': 'Weight (kg)',
    'owner.species.dog': 'Dog',
    'owner.species.cat': 'Cat',
    'owner.species.bird': 'Bird',
    'owner.species.rodent': 'Rodent',
    'owner.species.reptile': 'Reptile',
    'owner.species.other': 'Other',
    'owner.save_pet': 'Add record',
    'owner.saving_pet': 'Saving...',
    'owner.back': 'Back',
    'owner.book_heading': 'Book an Appointment',

    // ── Sidebar ──
    'sidebar.dashboard': 'Dashboard',
    'sidebar.owners': 'Owners',
    'sidebar.vets': 'Veterinarians',
    'sidebar.appointments': 'Appointments',
    'sidebar.settings': 'My Account',
    'sidebar.logout': 'Log Out',

    // ── Settings ──
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your personal information and preferences.',
    'settings.role.vet': 'Veterinarian',
    'settings.role.owner': 'Owner',
    'settings.field.fullname': 'Full Name',
    'settings.field.phone': 'Phone number',
    'settings.field.email': 'Email Address',
    'settings.secure': 'Secured data',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',

    // ── AI Symptom Checker ──
    'ai.title': 'AI Health Assistant',
    'ai.online': 'Online',
    'ai.welcome': "Hello! I'm VetoCare's AI assistant. I can assess your pet's symptoms or guide you around our website. How can I help you today?",
    'ai.placeholder': 'Describe symptoms...',
    'ai.book_btn': 'Book an Appointment',
    'ai.tooltip': 'AI Assistant',
    'ai.error': "Sorry, there was a connection problem with the AI. Please try again later or book an appointment directly.",
    'ai.no_reply': "I'm sorry, I couldn't analyze those symptoms.",

    // ── Common ──
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.error': 'An error occurred.',
    'common.success': 'Success!',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
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
