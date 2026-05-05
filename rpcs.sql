-- 3. CORE FUNCTIONS (RPCs)
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.veterinaires WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous WHERE veterinaire_id = v_id AND status NOT IN ('annulé', 'terminé')
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1800
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_in_patient(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'en_attente', checkin_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_appointment(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'confirmé', approved_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.cancel_appointment_by_patient(appointment_id UUID)
RETURNS VOID AS $$
DECLARE
    apt_record RECORD;
BEGIN
    SELECT * INTO apt_record FROM public.rendez_vous 
    WHERE id = appointment_id AND maitre_id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'Rendez-vous non trouvé ou accès refusé.'; END IF;
    UPDATE public.rendez_vous SET status = 'annulé' WHERE id = appointment_id;
    INSERT INTO public.consultations (patient_id, veterinaire_id, date_consultation, diagnosis, notes, price)
    VALUES (apt_record.patient_id, apt_record.veterinaire_id, apt_record.date_rdv, 'ANNULATION (Patient)', 'Rendez-vous annulé par le patient.', 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_maitre_id UUID, p_patient_id UUID, p_veterinaire_id UUID, p_date_rdv TIMESTAMP WITH TIME ZONE, p_health_record_url TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  conflict BOOLEAN;
BEGIN
  SELECT public.check_conflict(p_veterinaire_id, p_date_rdv) INTO conflict;
  IF conflict THEN RETURN json_build_object('success', false, 'message', 'Ce créneau est déjà réservé.'); END IF;
  INSERT INTO public.rendez_vous (maitre_id, patient_id, veterinaire_id, date_rdv, health_record_url, status)
  VALUES (p_maitre_id, p_patient_id, p_veterinaire_id, p_date_rdv, p_health_record_url, 'planifié');
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;