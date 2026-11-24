export const PLATFORM = {
  name: process.env.NEXT_PUBLIC_PLATFORM_NAME || "Instrunaka",
  fullName: "Instrunaka",
  tagline: "Le beat parfait pour ton prochain son.",
  description: "Des instrumentales de qualité par des beatmakers malgaches. Écoute, choisis, télécharge en un clic.",
  contact: {
    email: "henintsoaarnicaraharivony@gmail.com",
    phone: "033 93 427 44",
    address: "Fianarantsoa, Madagascar",
  },
  social: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
};

// URL publique de l'API (identique côté serveur et navigateur : pas de décalage d'hydratation)
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
