# 🐾 Veto-Care : Clinique Vétérinaire Cloud-Native
> **Extranet métier moderne construit pour la gestion clinique simplifiée**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://veto-care-2f5d.vercel.app/)
[![Supabase Stack](https://img.shields.io/badge/Stack-Supabase--React-blue?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 🏗️ Mission 4 : Le README "Architecte"

### 1. Mapping du Thème
**Thème :** Plateforme de gestion pour clinique vétérinaire (VetoCare), permettant la prise de rendez-vous, le suivi médical des animaux et la gestion des consultations par les vétérinaires.

*   **Table A (Entité Principale) :** `public.patients` (Les animaux de compagnie)
*   **Table B (Ressource) :** `public.rendez_vous` (Le planning et l'agenda des soins)
*   **Table C (Interaction) :** `public.consultations` (L'historique clinique et les diagnostics)
*   **Fichier (Storage) :** `health-records` bucket (Imagerie médicale, PDFs de carnet de santé)

---

### 2. L'Analyse d'Architecture

#### Pourquoi Vercel + Supabase (OPEX vs CAPEX) ?
Le choix de cette stack est financièrement plus logique qu’un serveur classique car il remplace des dépenses en **CAPEX** (Capital Expenditure) par de l'**OPEX** (Operating Expenses). 
Lancer un serveur classique exigerait un investissement initial lourd : achat de serveurs physiques, routeurs, onduleurs, et stockage (CAPEX). Pour ce projet, nous démarrons avec **zéro investissement matériel**. Grâce au modèle "Pay-as-you-go" de Vercel et Supabase, les coûts sont purement opérationnels (OPEX) : nous ne payons que pour les ressources consommées. Cela permet d'éliminer le risque financier lié à l'infrastructure avant même d'avoir un utilisateur actif.

#### Gestion de la Scalabilité (Vercel vs Data Center Physique)
Dans un **Data Center physique local**, la scalabilité est un défi logistique majeur. Si le trafic explose, il faut physiquement ajouter des serveurs rack, augmenter la capacité de **climatisation** pour éviter la surchauffe des machines, et gérer l'alimentation électrique. 
**Vercel** gère cela de manière totalement abstraite via le **Serverless**. Lorsqu'un pic de trafic survient, Vercel provisionne instantanément des fonctions de calcul supplémentaires sur son réseau mondial (Edge). Nous n'avons aucune climatisation à surveiller ni de câblage physique à modifier ; l'infrastructure s'adapte automatiquement à la charge logicielle en quelques millisecondes.

#### Donnée Structurée vs Donnée Non-structurée
*   **Donnée Structurée :** Ce sont toutes les informations organisées dans notre base PostgreSQL (Supabase). Par exemple, les noms des animaux, les dates de rendez-vous et les montants des consultations. Ces données suivent un schéma strict (colonnes, types UUID, relations FK) permettant des requêtes SQL complexes.
*   **Donnée Non-structurée :** Ce sont les **fichiers binaires** (images JPG d'examens, scans PDF) stockés dans notre bucket Storage. Ces données n'ont pas de format interne que la base de données peut analyser directement. Elles sont stockées en tant qu'objets (Blobs), et nous ne gardons que leur "lien" (URL) dans nos tables structurées.

---

## 📦 Livrables & Informations de Rendu

**Binôme :** [VOS NOMS ICI]
**Thème :** Clinique Vétérinaire (VetoCare)

- **URL de production :** [https://veto-care-2f5d.vercel.app/](https://veto-care-2f5d.vercel.app/)
- **Dépôt GitHub :** [https://github.com/estinaya2024/Veto-care](https://github.com/estinaya2024/Veto-care)

### 🔑 Identifiants de Test
| Rôle | Email | Mot de Passe |
| :--- | :--- | :--- |
| **Vétérinaire** | `doctor@vetocare.dz` | `password123` |
| **Patient (Maître)** | `patient@vetocare.dz` | `password123` |

---
*Projet réalisé dans le cadre du module "Build & Ship" - 2026*
