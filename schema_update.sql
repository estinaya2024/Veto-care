-- Extension for Calendar: Doctor Unavailabilities
CREATE TABLE IF NOT EXISTS public.indisponibilites_vet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    motif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;

-- Un vétérinaire peut tout faire sur ses propres indisponibilités
-- Note: On vérifie si l'auth.uid() correspond à l'user_id lié au vétérinaire_id
CREATE POLICY "Les vétérinaires gèrent leurs indispo" 
ON public.indisponibilites_vet FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.veterinaires v 
    WHERE v.id = public.indisponibilites_vet.veterinaire_id 
    AND v.user_id = auth.uid()
  )
);

-- Tout le monde peut voir les indisponibilités (pour éviter les réservations sur des créneaux bloqués)
CREATE POLICY "Tout le monde voit les indispo" 
ON public.indisponibilites_vet FOR SELECT
TO authenticated
USING (true);
