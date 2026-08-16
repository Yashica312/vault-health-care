-- ENUMS
CREATE TYPE public.record_type AS ENUM ('prescription','lab-report','scan','discharge','diagnosis','note','other');
CREATE TYPE public.record_category AS ENUM ('cardiology','radiology','pathology','endocrinology','pulmonology','orthopedics','dermatology','pediatrics','general','uncategorized');
CREATE TYPE public.relation_type AS ENUM ('self','spouse','parent','child','sibling','other');
CREATE TYPE public.notification_type AS ENUM ('reminder','prescription','checkup','security');
CREATE TYPE public.verification_status AS ENUM ('pending','verified','rejected');

-- shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAMILY MEMBERS
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relation public.relation_type NOT NULL DEFAULT 'other',
  age INTEGER,
  blood_group TEXT,
  emergency_contact TEXT,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  avatar_color TEXT NOT NULL DEFAULT 'hsl(221 83% 53%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own family members" ON public.family_members FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_family_updated BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DOCTORS (public directory)
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  license_number TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  hospital TEXT NOT NULL,
  location TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'verified',
  avatar_color TEXT NOT NULL DEFAULT 'hsl(221 83% 53%)',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
GRANT SELECT ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "directory readable" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEDICAL RECORDS
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  record_type public.record_type NOT NULL DEFAULT 'other',
  category public.record_category NOT NULL DEFAULT 'uncategorized',
  category_confidence NUMERIC(3,2) NOT NULL DEFAULT 0,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  doctor_name TEXT,
  hospital_name TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  extracted_text TEXT,
  ai_summary JSONB,
  file_path TEXT,
  file_type TEXT,
  file_size_kb INTEGER,
  thumbnail_color TEXT NOT NULL DEFAULT 'hsl(221 83% 53%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_records_user ON public.medical_records(user_id);
CREATE INDEX idx_records_member ON public.medical_records(family_member_id);
CREATE INDEX idx_records_date ON public.medical_records(record_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own records" ON public.medical_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_records_updated BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRESCRIPTIONS
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rx_user ON public.prescriptions(user_id);
CREATE INDEX idx_rx_member ON public.prescriptions(family_member_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_rx_updated BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEDICATIONS
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '',
  timing TEXT[] NOT NULL DEFAULT '{morning}',
  with_food BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  duration_days INTEGER NOT NULL DEFAULT 30,
  days_completed INTEGER NOT NULL DEFAULT 0,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_meds_rx ON public.medications(prescription_id);
CREATE INDEX idx_meds_user ON public.medications(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medications TO authenticated;
GRANT ALL ON public.medications TO service_role;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own medications" ON public.medications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_meds_updated BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'reminder',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EMERGENCY PROFILES (only emergency-safe fields)
CREATE TABLE public.emergency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  family_member_id UUID NOT NULL UNIQUE REFERENCES public.family_members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  blood_group TEXT,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  emergency_contact TEXT,
  current_medications TEXT[] NOT NULL DEFAULT '{}',
  critical_conditions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_emergency_user ON public.emergency_profiles(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_profiles TO authenticated;
GRANT ALL ON public.emergency_profiles TO service_role;
ALTER TABLE public.emergency_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own emergency profile" ON public.emergency_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_emergency_updated BEFORE UPDATE ON public.emergency_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own audit read" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SEED DOCTOR DIRECTORY
INSERT INTO public.doctors (name, specialization, license_number, years_experience, rating, hospital, location, verification_status, avatar_color, bio) VALUES
('Dr. Meera Iyer','Cardiology','MCI-2014-08231',11,4.9,'Apollo Hospital','Mumbai','verified','hsl(221 83% 53%)','Senior interventional cardiologist with focus on preventive cardiac care.'),
('Dr. Rohan Kapoor','General Physician','MCI-2017-19842',8,4.8,'Fortis Healthcare','Delhi','verified','hsl(173 80% 36%)','Family medicine specialist. Committed to long-term wellness plans.'),
('Dr. Anjali Verma','Dermatology','MCI-2019-44120',6,4.7,'Skin & Beyond Clinic','Bengaluru','verified','hsl(330 81% 60%)','Clinical dermatologist focused on chronic skin conditions.'),
('Dr. Vikram Singh','Orthopedics','MCI-2012-77001',13,4.9,'Max Super Speciality','Delhi','verified','hsl(262 83% 58%)','Joint replacement and sports injury specialist.'),
('Dr. Sneha Reddy','Pediatrics','MCI-2016-32099',9,4.9,'Rainbow Children''s Hospital','Hyderabad','verified','hsl(38 92% 50%)','Paediatrician with a focus on immunisation and child nutrition.'),
('Dr. Kavita Nair','Endocrinology','MCI-2015-55120',10,4.8,'Manipal Hospital','Bengaluru','verified','hsl(142 71% 45%)','Diabetes and thyroid disorder management.'),
('Dr. Arjun Mehta','Pulmonology','MCI-2013-66430',12,4.7,'Kokilaben Hospital','Mumbai','verified','hsl(199 89% 48%)','Respiratory medicine and sleep disorders.'),
('Dr. Priyanka Bose','Radiology','MCI-2018-90112',7,4.6,'AIIMS','Delhi','verified','hsl(291 64% 42%)','Diagnostic imaging and interventional radiology.');