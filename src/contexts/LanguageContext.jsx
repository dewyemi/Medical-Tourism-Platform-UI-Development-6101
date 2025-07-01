import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    welcome: 'Welcome to EMIRAFRIK',
    subtitle: 'Your trusted partner for medical tourism in Dubai',
    startInquiry: 'Start Medical Inquiry',
    viewPackages: 'View Packages',
    name: 'Full Name',
    country: 'Country',
    healthCondition: 'Health Condition',
    submit: 'Submit Inquiry',
    chat: 'Chat Assistant',
    packages: 'Medical Packages',
    payment: 'Payment',
    aftercare: 'Aftercare',
    dashboard: 'Dashboard',
    filter: 'Filter',
    budget: 'Budget',
    treatment: 'Treatment Type',
    tourism: 'Tourism Add-ons',
    // Package-specific translations
    medicalPackages: 'Medical Packages',
    packagesSubtitle: 'Discover our comprehensive medical tourism packages designed for your health and comfort in Dubai',
    searchPackages: 'Search packages, treatments...',
    filters: 'Filters',
    clear: 'Clear',
    treatmentType: 'Treatment Type',
    priceRange: 'Price Range',
    quickFilters: 'Quick Filters',
    allTreatments: 'All Treatments',
    cosmeticSurgery: 'Cosmetic Surgery',
    dentalCare: 'Dental Care',
    cardiology: 'Cardiology',
    orthopedics: 'Orthopedics',
    oncology: 'Oncology',
    fertility: 'Fertility',
    eyeCare: 'Eye Care',
    generalSurgery: 'General Surgery',
    min: 'Min',
    max: 'Max',
    under5k: 'Under $5,000',
    '5kTo15k': '$5,000 - $15,000',
    foundPackages: 'Found',
    refresh: 'Refresh',
    usingOfflineData: 'Using offline data',
    noPackagesFound: 'No packages found',
    noPackagesDescription: 'Try adjusting your search or filters to find what you\'re looking for',
    clearFilters: 'Clear Filters',
    cantFindPackage: 'Can\'t Find What You\'re Looking For?',
    customPackageDescription: 'Our medical tourism specialists can create a custom package tailored to your specific needs and budget.',
    chatWithSpecialist: 'Chat with Specialist',
    customRequest: 'Custom Request',
    days: 'days',
    inquire: 'Inquire',
    startingFrom: 'Starting from',
    medicalConsultation: 'Medical consultation & treatment',
    luxuryAccommodation: 'Luxury hotel accommodation',
    medicalSupport: '24/7 medical support',
    airportTransfers: 'Airport transfers included'
  },
  fr: {
    welcome: 'Bienvenue chez EMIRAFRIK',
    subtitle: 'Votre partenaire de confiance pour le tourisme médical à Dubaï',
    startInquiry: 'Commencer une Demande Médicale',
    viewPackages: 'Voir les Forfaits',
    name: 'Nom Complet',
    country: 'Pays',
    healthCondition: 'Condition de Santé',
    submit: 'Soumettre la Demande',
    chat: 'Assistant Chat',
    packages: 'Forfaits Médicaux',
    payment: 'Paiement',
    aftercare: 'Suivi',
    dashboard: 'Tableau de Bord',
    filter: 'Filtrer',
    budget: 'Budget',
    treatment: 'Type de Traitement',
    tourism: 'Suppléments Touristiques',
    // Package-specific translations
    medicalPackages: 'Forfaits Médicaux',
    packagesSubtitle: 'Découvrez nos forfaits complets de tourisme médical conçus pour votre santé et votre confort à Dubaï',
    searchPackages: 'Rechercher des forfaits, traitements...',
    filters: 'Filtres',
    clear: 'Effacer',
    treatmentType: 'Type de Traitement',
    priceRange: 'Gamme de Prix',
    quickFilters: 'Filtres Rapides',
    allTreatments: 'Tous les Traitements',
    cosmeticSurgery: 'Chirurgie Esthétique',
    dentalCare: 'Soins Dentaires',
    cardiology: 'Cardiologie',
    orthopedics: 'Orthopédie',
    oncology: 'Oncologie',
    fertility: 'Fertilité',
    eyeCare: 'Soins Oculaires',
    generalSurgery: 'Chirurgie Générale',
    min: 'Min',
    max: 'Max',
    under5k: 'Moins de 5 000 $',
    '5kTo15k': '5 000 $ - 15 000 $',
    foundPackages: 'Trouvé',
    refresh: 'Actualiser',
    usingOfflineData: 'Utilisation des données hors ligne',
    noPackagesFound: 'Aucun forfait trouvé',
    noPackagesDescription: 'Essayez d\'ajuster votre recherche ou vos filtres pour trouver ce que vous cherchez',
    clearFilters: 'Effacer les Filtres',
    cantFindPackage: 'Vous ne trouvez pas ce que vous cherchez?',
    customPackageDescription: 'Nos spécialistes du tourisme médical peuvent créer un forfait personnalisé adapté à vos besoins et budget spécifiques.',
    chatWithSpecialist: 'Discuter avec un Spécialiste',
    customRequest: 'Demande Personnalisée',
    days: 'jours',
    inquire: 'S\'enquérir',
    startingFrom: 'À partir de',
    medicalConsultation: 'Consultation et traitement médical',
    luxuryAccommodation: 'Hébergement de luxe',
    medicalSupport: 'Support médical 24/7',
    airportTransfers: 'Transferts aéroport inclus'
  },
  ar: {
    welcome: 'مرحباً بكم في إميرافريك',
    subtitle: 'شريككم الموثوق للسياحة العلاجية في دبي',
    startInquiry: 'بدء استفسار طبي',
    viewPackages: 'عرض الباقات',
    name: 'الاسم الكامل',
    country: 'البلد',
    healthCondition: 'الحالة الصحية',
    submit: 'إرسال الاستفسار',
    chat: 'مساعد المحادثة',
    packages: 'الباقات الطبية',
    payment: 'الدفع',
    aftercare: 'المتابعة',
    dashboard: 'لوحة التحكم',
    filter: 'تصفية',
    budget: 'الميزانية',
    treatment: 'نوع العلاج',
    tourism: 'الإضافات السياحية',
    // Package-specific translations
    medicalPackages: 'الباقات الطبية',
    packagesSubtitle: 'اكتشف باقاتنا الشاملة للسياحة العلاجية المصممة لصحتك وراحتك في دبي',
    searchPackages: 'البحث في الباقات والعلاجات...',
    filters: 'المرشحات',
    clear: 'مسح',
    treatmentType: 'نوع العلاج',
    priceRange: 'نطاق السعر',
    quickFilters: 'المرشحات السريعة',
    allTreatments: 'جميع العلاجات',
    cosmeticSurgery: 'الجراحة التجميلية',
    dentalCare: 'رعاية الأسنان',
    cardiology: 'أمراض القلب',
    orthopedics: 'جراحة العظام',
    oncology: 'الأورام',
    fertility: 'الخصوبة',
    eyeCare: 'رعاية العيون',
    generalSurgery: 'الجراحة العامة',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    under5k: 'أقل من 5,000 دولار',
    '5kTo15k': '5,000 - 15,000 دولار',
    foundPackages: 'وجدت',
    refresh: 'تحديث',
    usingOfflineData: 'استخدام البيانات غير المتصلة',
    noPackagesFound: 'لم يتم العثور على باقات',
    noPackagesDescription: 'حاول تعديل البحث أو المرشحات للعثور على ما تبحث عنه',
    clearFilters: 'مسح المرشحات',
    cantFindPackage: 'لا تجد ما تبحث عنه؟',
    customPackageDescription: 'يمكن لخبراء السياحة العلاجية لدينا إنشاء باقة مخصصة تناسب احتياجاتك وميزانيتك المحددة.',
    chatWithSpecialist: 'الدردشة مع متخصص',
    customRequest: 'طلب مخصص',
    days: 'أيام',
    inquire: 'استفسار',
    startingFrom: 'ابتداءً من',
    medicalConsultation: 'استشارة وعلاج طبي',
    luxuryAccommodation: 'إقامة فاخرة',
    medicalSupport: 'دعم طبي على مدار الساعة',
    airportTransfers: 'نقل المطار مشمول'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  const isRTL = currentLanguage === 'ar';

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t, isRTL }}>
      <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};