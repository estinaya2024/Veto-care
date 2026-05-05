-- 2. VIEWS
CREATE OR REPLACE VIEW public.waiting_room AS
SELECT r.id, r.date_rdv, r.checkin_at, p.name as patient_name, p.species, p.id as patient_id, v.name as vet_name, v.id as vet_id
FROM public.rendez_vous r
JOIN public.patients p ON r.patient_id = p.id
JOIN public.veterinaires v ON r.veterinaire_id = v.id
WHERE r.status = 'en_attente' AND r.date_rdv::date = CURRENT_DATE
ORDER BY r.checkin_at ASC;