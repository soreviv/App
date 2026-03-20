// Type definitions for Tinnitus Habituation App

export interface UserProgress {
  id: string;
  device_id: string;
  current_week: number;
  current_chapter: number;
  chapters_completed: number[];
  program_start_date: string;
  last_active: string;
  initial_distress_score: number | null;
  commitment_signed: boolean;
  commitment_date: string | null;
}

export interface DailyLog {
  id: string;
  device_id: string;
  date: string;
  distress_level: number;
  reflection: string | null;
  exercises_completed: string[];
  sleep_quality: number | null;
  notes: string | null;
  created_at: string;
}

export interface ABCRecord {
  id: string;
  device_id: string;
  date: string;
  situation: string;
  time: string | null;
  location: string | null;
  alarm_label: string;
  emotion: string;
  intensity: number;
  action_taken: string | null;
  alternative_label: string | null;
  new_intensity: number | null;
  created_at: string;
}

export interface ExposureStep {
  id: string;
  step_number: number;
  situation: string;
  anticipated_anxiety: number;
  attempts: ExposureAttempt[];
  is_dominated: boolean;
}

export interface ExposureAttempt {
  date: string;
  initial_anxiety: number;
  final_anxiety: number;
  used_label: boolean;
  dominated: boolean;
}

export interface ExposureLadder {
  id: string;
  device_id: string;
  steps: ExposureStep[];
  created_at: string;
  updated_at: string;
}

export interface EmergencyKitItem {
  id: string;
  device_id: string;
  category: 'alarm_signal' | 'containment_phrase' | 'rescue_action' | 'alternative_label' | 'custom';
  title: string;
  content: string;
  created_at: string;
}

export interface FactorLog {
  id: string;
  device_id: string;
  date: string;
  tinnitus_level: number;
  sleep_hours: number | null;
  caffeine_cups: number | null;
  alcohol_drinks: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface MindfulnessSession {
  id: string;
  device_id: string;
  date: string;
  time_of_day: 'morning' | 'night';
  completed: boolean;
  difficulty_level: number;
  observation: string | null;
  created_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  device_id: string;
  date: string;
  week_number: number;
  sleep_difficulty: number;
  concentration_interference: number;
  frustration_anger: number;
  social_impact: number;
  future_worry: number;
  relaxation_difficulty: number;
  overwhelm_despair: number;
  total_score: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  device_id: string;
  reminder_enabled: boolean;
  reminder_time: string;
  sound_masking_volume: number;
  preferred_sounds: string[];
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  weekId: number;
  title: string;
  subtitle: string;
  duration: string;
  exercises: string[];
}

export interface Week {
  id: number;
  title: string;
  part: string;
  partTitle: string;
  description: string;
  chapters: Chapter[];
}
