import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  species: z.string().min(1, "Veuillez choisir une espèce"),
  weight: z.string().optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  patientId: z.string().uuid("Veuillez sélectionner un animal"),
  date: z.string().min(1, "Veuillez choisir une date"),
  time: z.string().min(1, "Veuillez choisir une heure"),
  vetId: z.string().uuid().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  phone: z.string().min(10, "Le numéro de téléphone n'est pas valide").optional().or(z.literal('')),
});

export const consultationSchema = z.object({
  patientId: z.string().uuid(),
  symptoms: z.string().min(5, "Veuillez décrire les symptômes"),
  diagnosis: z.string().min(5, "Veuillez renseigner le diagnostic"),
  treatment: z.string().min(5, "Veuillez renseigner le traitement"),
  notes: z.string().optional(),
});
