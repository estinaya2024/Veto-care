-- Script pour remplir la Table B (Vétérinaires) avec des données de test
-- À exécuter dans l'éditeur SQL de Supabase

INSERT INTO public.veterinaires (id, name, specialty, description, image_url)
VALUES 
  (gen_random_uuid(), 'Dr. Martin', 'Chirurgie générale', 'Expert en soins canins et félins avec 10 ans d''expérience.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1ae?auto=format&fit=crop&q=80&w=200'),
  (gen_random_uuid(), 'Dr. Dubois', 'Dermatologie', 'Spécialiste des allergies et des problèmes de peau chez les animaux domestiques.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200'),
  (gen_random_uuid(), 'Dr. Lefebvre', 'Cardiologie', 'Passionnée par les petits mammifères et les soins préventifs.', 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200')
ON CONFLICT (id) DO NOTHING;
