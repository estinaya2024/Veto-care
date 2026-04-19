const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/+$/, '');
import { supabase } from './supabase';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  // Example Medical Methods
  async checkAppointmentConflict(vetId: string, dateRdv: string) {
    const { data, error } = await supabase.rpc('check_conflict', { v_id: vetId, rdv_date: dateRdv });
    if (error) throw error;
    return { conflict: data === true };
  },

  async getPrimaryVet() {
    const { data, error } = await supabase
      .from('veterinaires')
      .select('*')
      .limit(1)
      .single();
    if (error) throw new Error('Aucun vétérinaire trouvé');
    return data;
  },

  async getPatients() {
    return this.get('/patients');
  },

  async getUnavailability(vetId: string) {
    return this.get(`/unavailability/${vetId}`);
  },

  async createUnavailability(data: { veterinaire_id: string; start_time: string; end_time: string; motif?: string }) {
    return this.post('/unavailability', data);
  },

  async deleteUnavailability(id: string) {
    const response = await fetch(`${API_URL}/unavailability/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  // Clinical Operations (wrapping Supabase for consistency)
  async getOwnerProfile(userId: string) {
    const { data, error } = await supabase
      .from('maitres')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateOwnerProfile(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('maitres')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPatientsByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('maitre_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAppointmentsByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('rendez_vous')
      .select('*, veterinaires(name), patients(name)')
      .eq('maitre_id', ownerId)
      .order('date_rdv', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAllPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*, maitres(full_name)')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getTodayAppointments(vetId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('rendez_vous')
      .select('*, patients(*), maitres(full_name)')
      .eq('veterinaire_id', vetId)
      .neq('status', 'annulé')
      .gte('date_rdv', today.toISOString())
      .lt('date_rdv', tomorrow.toISOString())
      .order('date_rdv', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getNextAppointment(ownerId: string) {
    const { data, error } = await supabase
      .from('rendez_vous')
      .select('*, veterinaires(name)')
      .eq('maitre_id', ownerId)
      .neq('status', 'annulé')
      .gte('date_rdv', new Date().toISOString())
      .order('date_rdv', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
    return data || null;
  },

  async getPetClinicalHistory(petId: string) {
    const [apts, consults] = await Promise.all([
      supabase
        .from('rendez_vous')
        .select('*, veterinaires(name)')
        .eq('patient_id', petId)
        .order('date_rdv', { ascending: false }),
      supabase
        .from('consultations')
        .select('*, prescriptions(*), veterinaires(name)')
        .eq('patient_id', petId)
        .order('date_consultation', { ascending: false })
    ]);

    if (apts.error) throw apts.error;
    if (consults.error) throw consults.error;

    return {
      appointments: apts.data || [],
      consultations: consults.data || []
    };
  },

  async setPatientArchiveStatus(patientId: string, status: boolean) {
    const { data, error } = await supabase
      .from('patients')
      .update({ is_archived: status })
      .eq('id', patientId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const { data, error } = await supabase
      .from('rendez_vous')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
