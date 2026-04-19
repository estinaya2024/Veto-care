const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/+$/, '');
import { supabase } from './supabase';

interface UnavailabilityData {
  veterinaire_id: string;
  start_time: string;
  end_time: string;
  motif?: string;
}

interface OwnerUpdates {
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

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

  async createUnavailability(data: UnavailabilityData) {
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

  async updateOwnerProfile(userId: string, updates: OwnerUpdates) {
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
  }
};
