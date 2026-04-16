const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  async post(endpoint: string, data: any) {
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
    return this.post('/appointments/check-conflict', { vet_id: vetId, date_rdv: dateRdv });
  },

  async getPrimaryVet() {
    return this.get('/primary-vet');
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
    return fetch(`${API_URL}/unavailability/${id}`, { method: 'DELETE' }).then(res => res.json());
  }
};
