# Notes pour le rapport de stage

**Projet** : Origami Instrumentales — Plateforme de découverte, stockage et commercialisation d'instrumentales

**Stack** : Next.js 15 + Laravel 11 + PostgreSQL

**Auteur** : [Ton nom]
**Année** : 2026

---

## Sommaire

1. Présentation du projet
2. Architecture technique
3. Base de données
4. Backend (Laravel)
5. Frontend (Next.js)
6. Sécurité
7. Résolution des bugs (leçons apprises)
8. Choix techniques
9. Tests et validation
10. Perspectives d'évolution

---

## 1. Présentation du projet

### Objectif général
Créer une plateforme web centralisant un catalogue d'instrumentales
commercialisables, avec deux modes d'achat :
- **Non exclusif** : 7 000 Ar, plusieurs acheteurs possibles
- **Exclusif** : 20 000 Ar, retrait automatique du catalogue

### Cible utilisateurs
- Artistes / chanteurs cherchant des instrumentales
- Producteurs souhaitant proposer leurs créations
- Administrateur gérant le catalogue et les commandes

### Fonctionnalités principales (MVP)
- Catalogue public avec filtres (humeur, rythme, genre)
- Player audio pour preview
- Comptes utilisateurs avec authentification
- Parcours d'achat Mobile Banking manuel
- Validation administrative
- Téléchargements sécurisés

---

## 2. Architecture technique

### Vue d'ensemble
