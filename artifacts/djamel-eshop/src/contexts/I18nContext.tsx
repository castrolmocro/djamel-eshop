import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "ar" | "fr" | "en";

interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
    en: string;
  };
}

// Basic translations dictionary
export const translations: Translations = {
  home: { ar: "الرئيسية", fr: "Accueil", en: "Home" },
  listings: { ar: "الإعلانات", fr: "Annonces", en: "Listings" },
  dashboard: { ar: "لوحة التحكم", fr: "Tableau de bord", en: "Dashboard" },
  signIn: { ar: "تسجيل الدخول", fr: "Se connecter", en: "Sign In" },
  signUp: { ar: "إنشاء حساب", fr: "S'inscrire", en: "Sign Up" },
  searchPlaceholder: { ar: "ابحث عن منتجات، خدمات، أو متاجر...", fr: "Rechercher des produits, services...", en: "Search products, services..." },
  categories: { ar: "الفئات", fr: "Catégories", en: "Categories" },
  featured: { ar: "إعلانات مميزة", fr: "Annonces en vedette", en: "Featured" },
  nearby: { ar: "بالقرب منك", fr: "À proximité", en: "Nearby" },
  viewAll: { ar: "عرض الكل", fr: "Voir tout", en: "View All" },
  price: { ar: "السعر", fr: "Prix", en: "Price" },
  dzd: { ar: "د.ج", fr: "DZD", en: "DZD" },
  contactSeller: { ar: "تواصل مع البائع", fr: "Contacter le vendeur", en: "Contact Seller" },
  postListing: { ar: "أضف إعلانك", fr: "Publier une annonce", en: "Post Listing" },
  settings: { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
  logout: { ar: "تسجيل الخروج", fr: "Déconnexion", en: "Logout" },
  messages: { ar: "الرسائل", fr: "Messages", en: "Messages" },
  orders: { ar: "الطلبات", fr: "Commandes", en: "Orders" },
  myListings: { ar: "إعلاناتي", fr: "Mes annonces", en: "My Listings" },
  profile: { ar: "الملف الشخصي", fr: "Profil", en: "Profile" },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "ar";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string) => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir: language === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
