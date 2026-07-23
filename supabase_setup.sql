-- ==============================================================================
-- SPORTYREPS SUPABASE SETUP SCRIPT
-- Copy and paste this entire script into the Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create the submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Q1 & Q2
    source text,
    role text,
    
    -- Q3
    "minor-check" text,
    
    -- Talent Contact
    "talent-contact_firstname" text,
    "talent-contact_lastname" text,
    "talent-contact_phone" text,
    "talent-contact_email" text,
    
    -- Rep Info
    "rep-type" text,
    "rep-contact_rep_firstname" text,
    "rep-contact_rep_lastname" text,
    "rep-contact_rep_phone" text,
    "rep-contact_rep_email" text,
    
    -- Talent Info (via Rep)
    "talent-info-for-rep_firstname" text,
    "talent-info-for-rep_lastname" text,
    "talent-info-for-rep_phone" text,
    "talent-info-for-rep_email" text,
    
    -- File URLs
    "cv-upload_url" text,
    "photo-portrait_url" text,
    "photo-front_url" text,
    "photo-rear_url" text,
    
    -- Personal
    sex text,
    residence text,
    dob text,
    age integer,
    nationality text,
    "dual-nationality-check" text,
    "other-nationality" text,
    
    -- Football
    "academy-experience" text,
    "signed-pro" text,
    height text,
    weight integer,
    position text,
    foot text,
    "tactical-positions" text,
    "special-abilities" text,
    speed integer,
    
    -- Education & Legal
    education text,
    "passport-check" text,
    "passport-expiry" text,
    "travel-experience" text,
    "current-club" text,
    "medical-condition" text,
    "surgery-check" text,
    "criminal-record" text,
    "youtube-link" text
);

-- 2. Create Storage Buckets for Uploads
-- We need two public buckets: 'cvs' and 'photos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies so the backend can upload, and anyone can view the files
-- Allow public viewing of CVs and Photos
CREATE POLICY "Public Access for CVs" ON storage.objects FOR SELECT USING (bucket_id = 'cvs');
CREATE POLICY "Public Access for Photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

-- Allow all uploads (our Node.js backend handles the security/validation before uploading)
CREATE POLICY "Allow Uploads for CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "Allow Uploads for Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

-- 4. Set up Row Level Security (RLS) on the submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow the Node backend (using Anon key) to insert new submissions
CREATE POLICY "Enable insert for backend" ON public.submissions FOR INSERT WITH CHECK (true);

-- Allow Admin users (logged in via Supabase Auth) to read all submissions
CREATE POLICY "Enable read for admins" ON public.submissions FOR SELECT USING (auth.role() = 'authenticated');
