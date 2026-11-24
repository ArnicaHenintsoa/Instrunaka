// Déclaration de types pour permettre l'import de fichiers CSS
// depuis les fichiers TypeScript de Next.js.
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}