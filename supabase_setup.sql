-- ==============================================================================
-- SPORTYREPS SUPABASE SETUP SCRIPT
-- ==============================================================================
-- HOW TO USE:
--   1. Go to https://app.supabase.com and open your project.
--   2. In the left sidebar, click "SQL Editor".
--   3. Click "New query", paste this ENTIRE file, and click "Run".
--   4. All tables, buckets, policies, and indexes will be created automatically.
--
-- PREREQUISITES:
--   • You must have a Supabase project already created.
--   • After running this script, follow Step 5 at the bottom to create
--     your admin user account via the Supabase Auth dashboard.
-- ==============================================================================


-- ==============================================================================
-- STEP 1: Create the submissions table
-- ==============================================================================
-- This table stores every completed form submission.
-- Column names match exactly what the Node.js backend sends (from req.body
-- field names set in the client form config + appended _url for file fields).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
    -- Primary key & timestamp
    id          uuid                     DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- ── Q1 & Q2: Discovery & Role ─────────────────────────────────────────────
    -- "How did you find this link?" (source) and "Are you a Talent or Rep?" (role)
    source  text,   -- e.g. "Whatsapp", "Website", "Google search", etc.
    role    text,   -- "Talent" | "Representative"

    -- ── Q3: Minor check ───────────────────────────────────────────────────────
    -- Only asked when role = "Talent". A "Yes" ends the form early.
    "minor-check"  text,   -- "Yes" | "No"

    -- ── Talent Contact Info (filled by the talent directly) ───────────────────
    "talent-contact_firstname"  text,
    "talent-contact_lastname"   text,
    "talent-contact_phone"      text,
    "talent-contact_email"      text,

    -- ── Manager Info (only present when talent says they have a manager) ───────
    "has-manager"                        text,   -- "Yes" | "No"
    "manager-contact_manager_firstname"  text,
    "manager-contact_manager_lastname"   text,
    "manager-contact_manager_phone"      text,
    "manager-contact_manager_email"      text,

    -- ── Representative Info (filled when role = "Representative") ─────────────
    "rep-type"                   text,   -- e.g. "Biological Parent", "Guardian", etc.
    "rep-contact_rep_firstname"  text,
    "rep-contact_rep_lastname"   text,
    "rep-contact_rep_phone"      text,
    "rep-contact_rep_email"      text,

    -- ── Talent Info via Representative ────────────────────────────────────────
    -- The player's own details, entered by their rep on their behalf.
    "talent-info-for-rep_firstname"  text,
    "talent-info-for-rep_lastname"   text,
    "talent-info-for-rep_phone"      text,
    "talent-info-for-rep_email"      text,

    -- ── Uploaded File URLs (public Supabase Storage URLs) ────────────────────
    -- Populated by the Node.js backend after uploading files to Storage.
    -- CV is optional; all three photos are required by the form.
    "cv-upload_url"       text,   -- Public URL of the uploaded football CV (PDF)
    "photo-portrait_url"  text,   -- Public URL of the portrait photo
    "photo-front_url"     text,   -- Public URL of the full front view photo
    "photo-rear_url"      text,   -- Public URL of the full rear view photo

    -- ── Personal Info ─────────────────────────────────────────────────────────
    sex          text,     -- "Male" | "Female" | "Prefer not to say"
    residence    text,     -- Country of permanent/current residence (e.g. "United Kingdom")
    dob          text,     -- Date of birth in YYYY-MM-DD format
    age          integer,  -- Self-reported age
    nationality  text,     -- e.g. "British", "Ghanaian"

    "dual-nationality-check"  text,   -- "Yes" | "No"
    "other-nationality"       text,   -- Only present when dual-nationality-check = "Yes"

    -- ── Football Background ───────────────────────────────────────────────────
    "academy-experience"  text,    -- "Yes" | "No"
    "signed-pro"          text,    -- "Yes" | "No" — is the player already a signed pro?
    height                text,    -- Height in feet, e.g. "6'1\""
    weight                integer, -- Weight in kilograms
    position              text,    -- "Goalkeeper" | "Defender" | "Midfielder" | "Forward"
    foot                  text,    -- "Right" | "Left" | "Both"
    "tactical-positions"  text,    -- Free text, e.g. "Left Winger / Striker"
    "special-abilities"   text,    -- Free text, e.g. "Speed, dribbling, set-pieces"
    speed                 integer, -- Average speed in mph

    -- ── Education & Legal ─────────────────────────────────────────────────────
    education            text,   -- e.g. "High School / Secondary", "Undergraduate Degree"
    "passport-check"     text,   -- "Yes" | "No"
    "passport-expiry"    text,   -- Passport expiry in YYYY-MM-DD format (if passport exists)
    "travel-experience"  text,   -- "Yes" | "No" — international travel experience
    "current-club"       text,   -- e.g. "Arsenal FC Academy, London"
    "criminal-record"    text,   -- "Yes" | "No"

    -- ── Medical ───────────────────────────────────────────────────────────────
    "medical-condition"  text,   -- "Yes" | "No" — any football-related medical condition
    "surgery-check"      text,   -- "Yes" | "No" — surgery in the past 10 years

    -- ── Media ─────────────────────────────────────────────────────────────────
    "youtube-link"  text    -- YouTube highlight reel URL
);

-- Description/comment for the table (visible in Supabase Studio)
COMMENT ON TABLE public.submissions IS
  'Stores all completed Sportyreps football talent intake form submissions.';


-- ==============================================================================
-- STEP 2: Create an index for fast sorting in the Admin Panel
-- ==============================================================================
-- The admin dashboard fetches all submissions ordered by created_at DESC.
-- This index keeps that query fast even with thousands of rows.
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
    ON public.submissions (created_at DESC);


-- ==============================================================================
-- STEP 3: Enable Row Level Security (RLS) on the submissions table
-- ==============================================================================
-- RLS ensures that no data can be read or written without explicit policies below.
-- ==============================================================================

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow the Node.js backend (using the Anon key) to INSERT new submissions.
-- The backend validates and sanitises all input before calling Supabase,
-- so we trust inserts from any caller (the anon key is only exposed server-side).
DROP POLICY IF EXISTS "Enable insert for backend" ON public.submissions;
CREATE POLICY "Enable insert for backend"
    ON public.submissions
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated Admin users (logged in via Supabase Auth in the admin panel)
-- to SELECT (read) all submissions. The admin panel passes the user's JWT as a
-- Bearer token, which Supabase validates automatically against auth.role().
DROP POLICY IF EXISTS "Enable read for admins" ON public.submissions;
CREATE POLICY "Enable read for admins"
    ON public.submissions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated Admin users to UPDATE submissions (e.g. adding internal notes).
-- Remove this policy if you do not want admins to be able to edit records.
DROP POLICY IF EXISTS "Enable update for admins" ON public.submissions;
CREATE POLICY "Enable update for admins"
    ON public.submissions
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow authenticated Admin users to DELETE submissions if needed.
-- Remove this policy if you want to keep all records permanently.
DROP POLICY IF EXISTS "Enable delete for admins" ON public.submissions;
CREATE POLICY "Enable delete for admins"
    ON public.submissions
    FOR DELETE
    USING (auth.role() = 'authenticated');


-- ==============================================================================
-- STEP 4: Create Storage Buckets for file uploads
-- ==============================================================================
-- Two public buckets are used:
--   • 'cvs'    — stores uploaded football CV PDFs (max 10 MB, PDF only)
--   • 'photos' — stores portrait, front view, and rear view photos (max 10 MB)
--
-- Both buckets are PUBLIC so files can be linked to directly from the
-- admin panel without needing auth tokens on the URL.
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cvs',
    'cvs',
    true,
    10485760,  -- 10 MB max per file
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
    SET public             = EXCLUDED.public,
        file_size_limit    = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos',
    'photos',
    true,
    10485760,  -- 10 MB max per file
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
    SET public             = EXCLUDED.public,
        file_size_limit    = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ==============================================================================
-- STEP 4b: Set up Storage Policies
-- ==============================================================================

-- ── CVs bucket ────────────────────────────────────────────────────────────────

-- Anyone can publicly view/download CV files (needed for direct URL links in admin).
DROP POLICY IF EXISTS "Public read access for CVs" ON storage.objects;
CREATE POLICY "Public read access for CVs"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cvs');

-- The backend (anon key) can upload CVs. File validation is handled in Node.js
-- before the upload, so we allow any insert into this bucket.
DROP POLICY IF EXISTS "Allow uploads to CVs bucket" ON storage.objects;
CREATE POLICY "Allow uploads to CVs bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'cvs');

-- Admins can delete CV files from the dashboard if needed.
DROP POLICY IF EXISTS "Allow admin delete for CVs" ON storage.objects;
CREATE POLICY "Allow admin delete for CVs"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- ── Photos bucket ─────────────────────────────────────────────────────────────

-- Anyone can publicly view/download photos (needed for direct URL links in admin).
DROP POLICY IF EXISTS "Public read access for Photos" ON storage.objects;
CREATE POLICY "Public read access for Photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

-- The backend (anon key) can upload photos. File validation is handled in Node.js.
DROP POLICY IF EXISTS "Allow uploads to Photos bucket" ON storage.objects;
CREATE POLICY "Allow uploads to Photos bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos');

-- Admins can delete photos from the dashboard if needed.
DROP POLICY IF EXISTS "Allow admin delete for Photos" ON storage.objects;
CREATE POLICY "Allow admin delete for Photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'photos' AND auth.role() = 'authenticated');


-- ==============================================================================
-- STEP 5 (MANUAL — do this in the Supabase Dashboard, not here):
-- Create your Admin User account
-- ==============================================================================
--
-- The admin panel uses Supabase Auth (email + password) to gate access.
-- You must create at least one admin user manually:
--
--   Option A — Supabase Dashboard (recommended):
--     1. Go to https://app.supabase.com → Your Project → Authentication → Users
--     2. Click "Add user" → "Create new user"
--     3. Enter the admin email address and a strong password.
--     4. Click "Create user". The user is immediately active — no email needed.
--
--   Option B — SQL Editor (use with caution):
--     Run the following SQL (replace with real values):
--
--       SELECT auth.create_user(
--         '{"email": "admin@yourdomain.com", "password": "YourStrongPassword123!"}'::jsonb
--       );
--
-- ⚠️  IMPORTANT:
--   • Use a strong, unique password — this account controls all submission data.
--   • Store credentials in a password manager (e.g. 1Password, Bitwarden).
--   • Never share or commit admin credentials to version control.
--   • You can create multiple admin users by repeating either option above.
--
-- ==============================================================================


-- ==============================================================================
-- STEP 6: Set your credentials in the codebase
-- ==============================================================================
--
-- Find your credentials at: https://app.supabase.com → Settings → API
--
--   1. backend/.env (copy from backend/.env.example):
--        SUPABASE_URL      = https://xxxxxxxxxxxx.supabase.co
--        SUPABASE_ANON_KEY = eyJhbGci...
--
--   2. admin/js/config.js:
--        export const SUPABASE_URL      = 'https://xxxxxxxxxxxx.supabase.co';
--        export const SUPABASE_ANON_KEY = 'eyJhbGci...';
--
--   3. client/js/api.js (if applicable):
--        Update BACKEND_URL to point to your deployed Node.js backend URL.
--
-- ==============================================================================


-- ==============================================================================
-- STEP 7: Verify the setup (optional — run these queries to confirm)
-- ==============================================================================
--
-- Check all columns in the submissions table:
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'submissions'
--   ORDER BY ordinal_position;
--
-- Check storage buckets:
--   SELECT id, name, public, file_size_limit FROM storage.buckets;
--
-- Check RLS policies on the submissions table:
--   SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'submissions';
--
-- Check storage policies:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects';
--
-- ==============================================================================
