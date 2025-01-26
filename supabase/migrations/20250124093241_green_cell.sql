/*
  # Initial Schema Setup for Medical Conversation Platform

  1. Tables
    - profiles
      - Stores user profile information
      - Links to Supabase auth.users
    - doctor_settings
      - Stores doctor-specific settings
    - recordings
      - Stores audio recordings and transcripts
    - reports
      - Stores generated medical reports

  2. Security
    - RLS policies for each table
    - Separate access rules for doctors and patients
*/

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create doctor_settings table
CREATE TABLE doctor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  hospital TEXT NOT NULL,
  address TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_doctor UNIQUE (user_id)
);

-- Create recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(user_id) NOT NULL,
  patient_id UUID REFERENCES profiles(user_id) NOT NULL,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES recordings(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Doctor settings policies
CREATE POLICY "Doctors can manage their settings"
  ON doctor_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read doctor settings"
  ON doctor_settings FOR SELECT
  TO authenticated
  USING (true);

-- Recordings policies
CREATE POLICY "Doctors can manage their recordings"
  ON recordings FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = patient_id);

-- Reports policies
CREATE POLICY "Doctors can manage their reports"
  ON reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recordings
      WHERE recordings.id = recording_id
      AND recordings.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view their reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recordings
      WHERE recordings.id = recording_id
      AND recordings.patient_id = auth.uid()
    )
  );