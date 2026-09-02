CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  vehicle_number TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parking_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Metropolis',
  total_floors INT NOT NULL DEFAULT 3,
  total_slots INT NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parking_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_number TEXT NOT NULL,
  floor TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'CAR',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  price_per_hour NUMERIC(6, 2) NOT NULL DEFAULT 5.00,
  polygon_coords TEXT,
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INT NOT NULL DEFAULT 2,
  amount NUMERIC(8, 2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  payment_status TEXT NOT NULL DEFAULT 'PAID',
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_ref TEXT,
  total_vehicles INT NOT NULL DEFAULT 0,
  total_slots INT NOT NULL DEFAULT 8,
  occupied_slots INT NOT NULL DEFAULT 0,
  available_slots INT NOT NULL DEFAULT 0,
  occupancy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  confidence_avg NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  slot_details_json JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, vehicle_number, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'vehicle_number',
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER'),
    'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    vehicle_number = COALESCE(EXCLUDED.vehicle_number, public.profiles.vehicle_number),
    role = COALESCE(EXCLUDED.role, public.profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Locations are viewable by everyone" ON public.parking_locations FOR ALL USING (true);
CREATE POLICY "Slots are viewable by everyone" ON public.parking_slots FOR ALL USING (true);
CREATE POLICY "Bookings viewable by everyone" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Settings viewable by everyone" ON public.system_settings FOR ALL USING (true);
CREATE POLICY "AI detections viewable by everyone" ON public.ai_detections FOR ALL USING (true);

INSERT INTO public.parking_locations (id, name, address, city, total_floors, total_slots)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Grand Central AI Parking Facility', '100 Metro Terminal Way', 'Metropolis', 3, 24)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.parking_slots (slot_number, floor, vehicle_type, status, price_per_hour, location_id) VALUES
('A1', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('A2', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('A3', 'Ground Floor', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('A4', 'Ground Floor', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('A5', 'Ground Floor', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('A6', 'Ground Floor', 'EV', 'OCCUPIED', 7.50, 'a0000000-0000-0000-0000-000000000001'),
('A7', 'Ground Floor', 'EV', 'OCCUPIED', 7.50, 'a0000000-0000-0000-0000-000000000001'),
('A8', 'Ground Floor', 'BIKE', 'AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001'),
('B1', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('B2', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('B3', 'Floor 1', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('B4', 'Floor 1', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('B5', 'Floor 1', 'CAR', 'RESERVED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('B6', 'Floor 1', 'EV', 'AVAILABLE', 7.50, 'a0000000-0000-0000-0000-000000000001'),
('B7', 'Floor 1', 'BIKE', 'AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001'),
('B8', 'Floor 1', 'BIKE', 'AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001'),
('C1', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('C2', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('C3', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('C4', 'Floor 2', 'CAR', 'OCCUPIED', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('C5', 'Floor 2', 'CAR', 'AVAILABLE', 5.00, 'a0000000-0000-0000-0000-000000000001'),
('C6', 'Floor 2', 'EV', 'AVAILABLE', 7.50, 'a0000000-0000-0000-0000-000000000001'),
('C7', 'Floor 2', 'BIKE', 'AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001'),
('C8', 'Floor 2', 'BIKE', 'AVAILABLE', 2.50, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
