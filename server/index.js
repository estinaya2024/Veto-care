import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: 'uploads/' });

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
  res.json({ status: 'ok', message: 'VetoCare API is clinical and ready.' });
});

/**
 * AI BACKGROUND REMOVAL
 * Uses the rembg.py script to remove backgrounds from pet photos
 */
app.post('/api/remove-bg', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const inputPath = req.file.path;
  const outputPath = `${inputPath}_out.png`;
  const scriptPath = path.join(__dirname, '..', 'remove_bg.py');

  // Ensure absolute paths for safety
  const absInput = path.resolve(inputPath);
  const absOutput = path.resolve(outputPath);

  console.log(`AI Processing started for: ${absInput}`);

  exec(`python "${scriptPath}" "${absInput}" "${absOutput}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`AI Background Removal EXEC Error: ${error.message}`);
      console.error(`AI Background Removal STDERR: ${stderr}`);
      if (fs.existsSync(absInput)) fs.unlinkSync(absInput);
      return res.status(500).json({ 
        error: 'Failed to process image background',
        details: stderr || error.message 
      });
    }
    
    console.log(`AI Processing success: ${absOutput}`);
    res.sendFile(absOutput, () => {
      // Cleanup temp files after sending
      if (fs.existsSync(absInput)) fs.unlinkSync(absInput);
      if (fs.existsSync(absOutput)) fs.unlinkSync(absOutput);
    });
  });
});

/**
 * GET PRIMARY VET
 * Since this is a one-doctor clinic, we provide an endpoint to get the doctor's info
 */
app.get('/api/primary-vet', async (req, res) => {
  const { data, error } = await supabase
    .from('veterinaires')
    .select('*')
    .limit(1)
    .single();

  if (error) return res.status(404).json({ message: 'Doctor not found. Please ensure the doctor profile is seeded.' });
  res.json(data);
});

// Patients Route
app.get('/api/patients', async (req, res) => {
  const { data, error } = await supabase.from('patients').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// Appointments Route (Basic)
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

  if (!vet_id || !date_rdv) {
    return res.status(400).json({ message: 'Missing vet_id or date_rdv' });
  }

  // Use the same date string for comparison
  const requestedDate = new Date(date_rdv).toISOString();

  // 1. Check existing appointments
  // We check for any appointment that overlaps with the requested time (assuming 30min slots)
  const { data: apptData, error: apptError } = await supabase
    .from('rendez_vous')
    .select('id, date_rdv')
    .eq('veterinaire_id', vet_id)
    .neq('status', 'annulé');

  if (apptError) return res.status(400).json(apptError);

  // Simple overlap check: exact match or within 29 minutes
  const hasConflict = apptData.some(apt => {
    const existingDate = new Date(apt.date_rdv);
    const requestedDateObj = new Date(requestedDate);
    const diff = Math.abs(existingDate.getTime() - requestedDateObj.getTime());
    return diff < (29 * 60 * 1000); // Less than 29 mins difference
  });

  if (hasConflict) return res.json({ conflict: true, reason: 'appointment' });

  // 2. Check doctor unavailabilities (blocked slots)
  const { data: unavailData, error: unavailError } = await supabase
    .from('indisponibilites_vet')
    .select('id, start_time, end_time')
    .eq('veterinaire_id', vet_id);

  if (unavailError) return res.status(400).json(unavailError);

  const isBlocked = unavailData.some(un => {
    const start = new Date(un.start_time).getTime();
    const end = new Date(un.end_time).getTime();
    const requested = new Date(requestedDate).getTime();
    return (requested >= start && requested < end);
  });

  res.json({ conflict: isBlocked, reason: isBlocked ? 'blocked' : null });
});

// --- OpenRouter AI Integration ---

const FREE_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-4-31b-it:free'
];

const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  const { message, history, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not configured' });
  }

  const conversationId = sessionId || 'default';
  let conversation = conversations.get(conversationId);

  if (!conversation) {
    conversation = [];
    conversations.set(conversationId, conversation);
  }

  try {
    const systemMessage = {
      role: 'system',
      content: "Vous êtes l'assistant IA de VetoCare. Aidez avec les symptômes animaux et guidez sur le site (carnet, rdv, dashboard). Soyez concis."
    };

    const messages = [
      systemMessage,
      ...conversation,
      { role: 'user', content: message }
    ];

    let response;
    let lastError;
    let attempt = 0;
    let modelIndex = 0;
    const maxAttempts = FREE_MODELS.length * 3;

    while (attempt < maxAttempts) {
      modelIndex = attempt % FREE_MODELS.length;
      const model = FREE_MODELS[modelIndex];
      const delay = Math.pow(2, Math.floor(attempt / FREE_MODELS.length)) * 2000;

      if (attempt > 0) {
        console.log(`Waiting ${delay}ms before attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log(`Trying model: ${model} (attempt ${attempt + 1})`);
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vetocare.app',
          'X-Title': 'VetoCare'
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (response.ok) {
        console.log(`Success with model: ${model}`);
        break;
      } else {
        const errorText = await response.text();
        lastError = errorText;
        console.log(`Model ${model} failed:`, errorText);
        attempt++;
      }
    }

    if (!response.ok) {
      let errorMessage = 'All models failed';
      try {
        const errorData = JSON.parse(lastError);
        errorMessage = errorData.error?.message || errorData.message || lastError;
      } catch {
        errorMessage = lastError;
      }
      console.error('AI API error response:', lastError);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    conversation.push({ role: 'user', content: message });
    conversation.push({ role: 'assistant', content: reply });

    res.json({ reply, usedModel: FREE_MODELS[modelIndex] });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: "Erreur lors de la communication avec l'assistant IA.", details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VetoCare Server running on http://localhost:${PORT}`);
});