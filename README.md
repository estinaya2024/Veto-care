# Clinique Vétérinaire - Veto-Care 🐾

Ce projet est un extranet vétérinaire complet construit avec React, TypeScript et Supabase, répondant aux critères des 4 Missions (Data, Frontend, DevOps, README).

---

## 🛠️ Mission 4 : Le README "Architecte"

### 🎯 Mapping du Thème
Pour faciliter la correction, voici comment nous avons traduit les exigences du sujet dans notre application :

| Élément | Correspondance dans l'Application | Description |
| :--- | :--- | :--- |
| **Table A** | `maitres` | Les propriétaires d'animaux (Clients). Chaque utilisateur authentifié a un profil unique. |
| **Table B** | `veterinaires` | Le catalogue des professionnels de santé disponibles dans la clinique. |
| **Table C** | `rendez_vous` | L'interaction principale : un maître prend rendez-vous avec un vétérinaire. |
| **Fichier** | `Carnet de santé` | Document (PDF/Image) uploadé par le maître lors de la prise de rendez-vous. |

---

### 🏛️ Analyse d'Architecture

#### 1. Pourquoi Vercel + Supabase est-il plus logique financièrement ? (**CAPEX vs OPEX**)
Lancer ce projet avec un serveur classique nécessiterait un **CAPEX** (Capital Expenditure) important : achat de serveurs physiques, routeurs, onduleurs et climatisation. C'est un coût "en amont" risqué pour une nouvelle application.
En utilisant Vercel et Supabase, nous passons à un modèle **OPEX** (Operating Expenditure). Nous ne payons que pour l'utilisation réelle (frais de fonctionnement). La barrière à l'entrée est quasi-nulle (Tier gratuit), ce qui permet de valider le projet sans investissement lourd initial.

#### 2. Gestion de la scalabilité : Vercel vs Data Center physique local
Dans un **Data Center physique**, la scalabilité est verticale (ajouter de la RAM, des CPU) ou horizontale manuelle (acheter de nouveaux racks). C'est lent et coûteux en maintenance (gestion de la chaleur, électricité).
**Vercel** utilise une architecture **Edge/Serverless**. Notre application est distribuée sur des centaines de serveurs à travers le monde. Si le trafic explose (ex: campagne de vaccination massive), Vercel alloue automatiquement plus de ressources sans que nous n'ayons à manipuler de matériel physique. C'est une scalabilité élastique instantanée.

#### 3. Donnée Structurée vs Non-structurée
- **Donnée Structurée** : Ce sont nos tables SQL (`maitres`, `veterinaires`, `rendez_vous`). Elles suivent un schéma strict (IDs, dates, relations) et sont stockées dans PostgreSQL sur Supabase. Elles sont faciles à requêter et à filtrer.
- **Donnée Non-structurée** : Ce sont les **Carnets de santé** (fichiers PDF, JPG, PNG). Ces données n'ont pas de format de recherche interne pour SQL. Elles sont stockées de manière brute dans le **Supabase Storage** (Object Storage), et nous ne gardons que leur lien (URL) dans notre base structurée.

---

## 🚀 Installation & Lancement local

1. Clonez le dépôt.
2. `npm install`
3. Créez un fichier `.env` basé sur `.env.example` avec vos clés Supabase.
4. Exécutez le script `database.sql` dans votre éditeur SQL Supabase.
5. `npm run dev`

---

## 🧪 Identifiants de test (Professeur)
- **Email** : `prof@test.fr`
- **Mot de passe** : `VetoCare2024!`

