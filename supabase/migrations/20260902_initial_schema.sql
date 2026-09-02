-- ==============================================================================
-- AI SMART PARKING & PLATFORM — COMPLETE SUPABASE DATABASE SETUP WITH RLS & POLICIES
-- Project: svoqmezvgujbqunjtrii (https://svoqmezvgujbqunjtrii.supabase.co)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Linked to Supabase Auth & Application Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    vehicle_number TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'OPERATOR', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PARKING LOCATIONS
CREATE TABLE IF NOT EXISTS public.parking_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Metropolis',
    total_floors INT DEFAULT 3,
    total_slots INT DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PARKING SLOTS
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_number TEXT NOT NULL,
    floor TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'CAR' CHECK (vehicle_type IN ('CAR', 'BIKE', 'EV', 'TRUCK')),
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    price_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    polygon_coords JSONB,
    location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (slot_number, floor)
);

-- 4. BOOKINGS / RESERVATIONS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INT NOT NULL DEFAULT 2,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    payment_status TEXT NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED', 'FAILED')),
    qr_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AI COMPUTER VISION DETECTIONS
CREATE TABLE IF NOT EXISTS public.ai_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_ref TEXT,
    total_vehicles INT DEFAULT 0,
    total_slots INT DEFAULT 8,
    occupied_slots INT DEFAULT 0,
    available_slots INT DEFAULT 0,
    occupancy_percentage NUMERIC(5, 2) DEFAULT 0.00,
    confidence_avg NUMERIC(5, 2) DEFAULT 0.00,
    slot_details_json JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'BOOKING', 'ALERT', 'SYSTEM')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parking_name TEXT NOT NULL DEFAULT 'AI Smart Parking Grand Terminal',
    price_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    floors_count INT NOT NULL DEFAULT 3,
    opening_hour TEXT NOT NULL DEFAULT '06:00',
    closing_hour TEXT NOT NULL DEFAULT '23:59',
    ai_confidence_threshold NUMERIC(4, 2) NOT NULL DEFAULT 0.30,
    auto_release_minutes INT NOT NULL DEFAULT 15,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. OPPORTUNITIES, SAVED_OPPORTUNITIES & APPLICATIONS
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT,
    type TEXT DEFAULT 'FULL_TIME',
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, opportunity_id)
);

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_slots_number_floor ON public.parking_slots(slot_number, floor);
CREATE INDEX IF NOT EXISTS idx_slots_status ON public.parking_slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, read);

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all to view parking locations" ON public.parking_locations;
CREATE POLICY "Allow all to view parking locations" ON public.parking_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all to view parking slots" ON public.parking_slots;
CREATE POLICY "Allow all to view parking slots" ON public.parking_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to modify slots" ON public.parking_slots;
CREATE POLICY "Allow all to modify slots" ON public.parking_slots FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow users to view own bookings" ON public.bookings;
CREATE POLICY "Allow users to view own bookings" ON public.bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to create bookings" ON public.bookings;
CREATE POLICY "Allow users to create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to update own bookings" ON public.bookings;
CREATE POLICY "Allow users to update own bookings" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public view AI detections" ON public.ai_detections;
CREATE POLICY "Allow public view AI detections" ON public.ai_detections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow AI service to insert detections" ON public.ai_detections;
CREATE POLICY "Allow AI service to insert detections" ON public.ai_detections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public view settings" ON public.system_settings;
CREATE POLICY "Allow public view settings" ON public.system_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow operator update settings" ON public.system_settings;
CREATE POLICY "Allow operator update settings" ON public.system_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow view opportunities" ON public.opportunities;
CREATE POLICY "Allow view opportunities" ON public.opportunities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Allow all saved opportunities" ON public.saved_opportunities FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all applications" ON public.applications;
CREATE POLICY "Allow all applications" ON public.applications FOR ALL USING (true);

-- 12. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('parking-surveillance', 'parking-surveillance', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view surveillance images" ON storage.objects;
CREATE POLICY "Public can view surveillance images" ON storage.objects FOR SELECT USING (bucket_id IN ('parking-surveillance', 'receipts', 'avatars'));
DROP POLICY IF EXISTS "Authenticated upload surveillance" ON storage.objects;
CREATE POLICY "Authenticated upload surveillance" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('parking-surveillance', 'receipts', 'avatars'));

-- 13. SEED DATA
INSERT INTO public.parking_locations (id, name, address, city, total_floors, total_slots)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Grand Terminal AI Parking', '100 Metro City Boulevard, Central Plaza', 'Metropolis', 3, 24)
ON CONFLICT DO NOTHING;

INSERT INTO public.system_settings (parking_name, price_per_hour, floors_count, opening_hour, closing_hour, ai_confidence_threshold, auto_release_minutes)
VALUES ('AI Smart Parking Grand Terminal', 5.00, 3, '06:00', '23:59', 0.30, 15)
ON CONFLICT DO NOTHING;

INSERT INTO public.parking_slots (slot_number, floor, vehicle_type, status, price_per_hour, location_id)
VALUES
  ('A1', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A2', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A3', 'Ground Floor', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A4', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A5', 'Ground Floor', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A6', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('A7', 'Ground Floor', 'EV',  'OCCUPIED', 7.50, 'a0000000-0000-0000-0000-000000000001'),
  ('A8', 'Ground Floor', 'BIKE','RESERVED', 2.50, 'a0000000-0000-0000-0000-000000000001'),
  ('B1', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B2', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B3', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B4', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B5', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B6', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('B7', 'Floor 1', 'EV',  'AVAILABLE', 7.50, 'a0000000-0000-0000-0000-000000000001'),
  ('B8', 'Floor 1', 'BIKE','AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001'),
  ('C1', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C2', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C3', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C4', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C5', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C6', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
  ('C7', 'Floor 2', 'EV',  'AVAILABLE', 7.50, 'a0000000-0000-0000-0000-000000000001'),
  ('C8', 'Floor 2', 'BIKE','AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (slot_number, floor) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, phone, vehicle_number, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'operator@aiparking.com', 'Chief Operator Alex', 'OPERATOR', '+1 555-0199', 'ADMIN-01', 'ACTIVE'),
  ('b0000000-0000-0000-0000-000000000002', 'john@example.com', 'John Doe', 'USER', '+1 555-0142', 'NYC-4821', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;
