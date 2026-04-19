import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlzwhgcpepqsavjgmld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bHp3aGdjcGVwcXNhdmpnbWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTM2NDgsImV4cCI6MjA5MTcyOTY0OH0.tWVPU7mmqKkp0SeplCfBObnFwfOdGHZ4IUN7qFcd8DQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("1. Testing getPrimaryVet...");
  const { data: v1, error: e1 } = await supabase.from('veterinaires').select('*').limit(1).single();
  console.log("VET RESULT:", e1 ? e1.message : 'OK');

  console.log("2. Testing check_conflict RPC...");
  const { data: v2, error: e2 } = await supabase.rpc('check_conflict', { v_id: '00000000-0000-0000-0000-000000000000', rdv_date: new Date().toISOString() });
  console.log("RPC RESULT:", e2 ? e2.message : 'OK');
}

test();
