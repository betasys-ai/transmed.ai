export interface User {
  id: string;
  name: string;
  role: 'doctor' | 'patient';
}

export interface Recording {
  id: string;
  audioUrl: string;
  transcript: string | null;
  detectedLanguage?: string;
  notes: string;
  createdAt: Date;
  expiresAt: Date;
  doctorName: string;
  patientName: string;
  status: 'recording' | 'transcribing' | 'ready' | 'editing';
  aiReport?: {
    symptoms: string[];
    diagnosis: string;
    treatment: string;
    followUp: string;
    medications: Array<{ name: string; dosage: string; frequency: string }>;
  };
}

export interface DoctorSettings {
  name: string;
  hospital: string;
  address: string;
  logoUrl?: string;
}

export interface OpenAIError extends Error {
  status?: number;
  code?: string;
}