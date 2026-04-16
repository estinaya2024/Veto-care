import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VetoMedical API is clinical and ready.' });
});

// Patients Route
app.get('/api/patients', async (req, res) => {
  const { data, error } = await supabase.from('patients').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// Appointments Route
app.get('/api/appointments', async (req, res) => {
  const { data, error } = await supabase.from('rendez_vous').select('*, patients(*), veterinaires(*)');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// --- Unavailability Endpoints ---

// Get unavailabilities for a vet
app.get('/api/unavailability/:vetId', async (req, res) => {
  const { vetId } = req.params;
  const { data, error } = await supabase
    .from('indisponibilites_vet')
    .select('*')
    .eq('veterinaire_id', vetId);
  if (error) return res.status(400).json(error);
  res.json(data);
});

// Create unavailability
app.post('/api/unavailability', async (req, res) => {
  const { veterinaire_id, start_time, end_time, motif } = req.body;
  const { data, error } = await supabase
    .from('indisponibilites_vet')
    .insert([{ veterinaire_id, start_time, end_time, motif }])
    .select();
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

// Delete unavailability
app.delete('/api/unavailability/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('indisponibilites_vet')
    .delete()
    .eq('id', id);
  if (error) return res.status(400).json(error);
  res.json({ success: true });
});

// --- Enhanced Conflict Logic ---

// Appointment Conflict Check (Server-side logic)
app.post('/api/appointments/check-conflict', async (req, res) => {
  const { vet_id, date_rdv } = req.body;
  
  // 1. Check existing appointments
  const { data: apptData, error: apptError } = await supabase
    .from('rendez_vous')
    .select('id')
    .eq('veterinaire_id', vet_id)
    .eq('date_rdv', date_rdv)
    .neq('status', 'annulé');
  
  if (apptError) return res.status(400).json(apptError);
  if (apptData.length > 0) return res.json({ conflict: true, reason: 'appointment' });

  // 2. Check doctor unavailabilities (blocked slots)
  // We check if the requested time falls between start_time and end_time
  const { data: unavailData, error: unavailError } = await supabase
    .from('indisponibilites_vet')
    .select('id')
    .eq('veterinaire_id', vet_id)
    .lte('start_time', date_rdv)
    .gte('end_time', date_rdv);

  if (unavailError) return res.status(400).json(unavailError);
  
  res.json({ conflict: unavailData.length > 0, reason: unavailData.length > 0 ? 'blocked' : null });
});

app.listen(PORT, () => {
  console.log(`🚀 VetoMedical Server running on http://localhost:${PORT}`);
});
