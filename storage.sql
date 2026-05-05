-- 6. REALTIME & STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Permissive Storage All" ON storage.objects FOR ALL USING (bucket_id = 'health-records') WITH CHECK (bucket_id = 'health-records');

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;