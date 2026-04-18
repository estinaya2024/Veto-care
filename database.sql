-- Mission 1: Modélisation SQL pour "Veto-Care"

-- 1. Table A: Maîtres (Profils)
CREATE TABLE IF NOT EXISTS public.maitres (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger pour créer automatiquement un profil ou un vétérinaire à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Explicit check for the Clinic specialized email
  IF new.email = 'a_karou@estin.dz' THEN
    user_role := 'vet';
  ELSE
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'owner');
  END IF;
  
  IF user_role = 'owner' THEN
    INSERT INTO public.maitres (id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)));
  ELSIF user_role = 'vet' THEN
    INSERT INTO public.veterinaires (user_id, name, specialty)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Dr. ' || SPLIT_PART(new.email, '@', 1)), 'Généraliste');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table additionnelle : Patients (Animaux)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    last_visit TIMESTAMP WITH TIME ZONE,
    next_vax TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS
ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Les maîtres peuvent voir leur propre profil" 
ON public.maitres FOR SELECT 
USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Les maîtres peuvent modifier leur propre profil" 
ON public.maitres FOR UPDATE 
USING (auth.uid() = id);

-- 2. Table B: Vétérinaires (Ressources)
CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;

-- Tout le monde (connecté) peut voir les vétérinaires
CREATE POLICY "Tout le monde peut voir les vétérinaires" 
ON public.veterinaires FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Les maîtres voient uniquement leurs patients" 
ON public.patients FOR SELECT 
USING (auth.uid() = maitre_id);

CREATE POLICY "Les maîtres créent leurs propres patients" 
ON public.patients FOR INSERT 
WITH CHECK (auth.uid() = maitre_id);

-- 3. Table C: Rendez-vous (Interactions)
CREATE TABLE IF NOT EXISTS public.rendez_vous (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date_rdv TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'en_attente',
    health_record_url TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS (CRITÈRE ÉLIMINATOIRE)
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;

-- Un maître ne peut voir QUE ses propres rendez-vous
CREATE POLICY "Les maîtres voient uniquement leurs rendez-vous" 
ON public.rendez_vous FOR SELECT 
USING (auth.uid() = maitre_id);

-- Un maître peut créer ses propres rendez-vous
CREATE POLICY "Les maîtres créent leurs propres rendez-vous" 
ON public.rendez_vous FOR INSERT 
WITH CHECK (auth.uid() = maitre_id);

-- 4. Storage Setup (Carnets de santé)
-- Note: Le bucket 'health-re  cords' doit être créé manuellement dans l'interface Supabase.
-- Voici les politiques de sécurité pour le storage:

-- INSERT: Un utilisateur ne peut uploader que dans son propre dossier/chemin
-- SELECT: Un utilisateur ne peut voir que ses propres fichiers
