export function formatPrice(price: number | null | undefined): string {
  if (price === undefined || price === null) return "0 Ar";
  // Utilisation de l'espace insécable (U+00A0) pour que Manrope l'affiche correctement
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") + " Ar";
}