import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DailyLog, ABCRecord, ExposureLadder, EmergencyKitItem, QuestionnaireResponse, FactorLog, MindfulnessSession, UserSettings } from '../types';
import { scheduleDailyReminder, cancelAllReminders } from '../utils/notifications';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

console.log(API_URL, 'EXPO_PUBLIC_BACKEND_URL');

interface AppState {
  // Device ID
  deviceId: string | null;
  isLoading: boolean;
  
  // User Progress
  progress: UserProgress | null;
  
  // Daily Logs
  dailyLogs: DailyLog[];
  
  // ABC Records
  abcRecords: ABCRecord[];
  
  // Exposure Ladder
  exposureLadder: ExposureLadder | null;
  
  // Emergency Kit
  emergencyKit: EmergencyKitItem[];
  
  // Questionnaire Responses
  questionnaireResponses: QuestionnaireResponse[];
  
  // Actions
  initialize: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  updateProgress: (update: Partial<UserProgress>) => Promise<void>;
  completeChapter: (chapterId: number) => Promise<void>;
  
  // Daily Log Actions
  createDailyLog: (log: Omit<DailyLog, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchDailyLogs: () => Promise<void>;
  
  // ABC Record Actions
  createABCRecord: (record: Omit<ABCRecord, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchABCRecords: () => Promise<void>;
  updateABCRecord: (recordId: string, alternativeLabel: string, newIntensity: number) => Promise<void>;
  
  // Exposure Ladder Actions
  createExposureLadder: (steps: any[]) => Promise<void>;
  fetchExposureLadder: () => Promise<void>;
  addExposureAttempt: (stepNumber: number, attempt: any) => Promise<void>;
  
  // Emergency Kit Actions
  addEmergencyKitItem: (item: Omit<EmergencyKitItem, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchEmergencyKit: () => Promise<void>;
  deleteEmergencyKitItem: (itemId: string) => Promise<void>;
  
  // Questionnaire Actions
  submitQuestionnaire: (response: Omit<QuestionnaireResponse, 'id' | 'device_id' | 'total_score' | 'created_at'>) => Promise<void>;
  fetchQuestionnaireResponses: () => Promise<void>;

  // Factor Log Actions
  factorLogs: FactorLog[];
  createFactorLog: (log: Omit<FactorLog, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchFactorLogs: () => Promise<void>;

  // Mindfulness Session Actions
  mindfulnessSessions: MindfulnessSession[];
  createMindfulnessSession: (session: Omit<MindfulnessSession, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchMindfulnessSessions: () => Promise<void>;

  // Settings Actions
  settings: UserSettings | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (update: Partial<UserSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  deviceId: null,
  isLoading: true,
  progress: null,
  dailyLogs: [],
  abcRecords: [],
  exposureLadder: null,
  emergencyKit: [],
  questionnaireResponses: [],
  factorLogs: [],
  mindfulnessSessions: [],
  settings: null,
  
  initialize: async () => {
    console.log('Initializing app...');
    try {
      let deviceId: string | null = null;
      try {
        deviceId = await AsyncStorage.getItem('device_id');
      } catch (e) {
        console.log('AsyncStorage error, using fallback:', e);
      }
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          await AsyncStorage.setItem('device_id', deviceId);
        } catch (e) {
          console.log('AsyncStorage setItem error:', e);
        }
      }
      console.log('Device ID:', deviceId);
      set({ deviceId });
      
      // Fetch initial data
      console.log('Fetching progress...');
      await get().fetchProgress();
      console.log('Fetching daily logs...');
      await get().fetchDailyLogs();
      console.log('Fetching emergency kit...');
      await get().fetchEmergencyKit();

      // Restore notification schedule from settings
      await get().fetchSettings();
      const currentSettings = get().settings;
      if (currentSettings?.reminder_enabled) {
        const [h, m] = currentSettings.reminder_time.split(':');
        await scheduleDailyReminder(parseInt(h), parseInt(m));
      } else {
        await cancelAllReminders();
      }

      console.log('Initialization complete');
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isLoading: false });
    }
  },
  
  fetchProgress: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId }),
      });
      const data = await response.json();
      set({ progress: data });
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  },
  
  updateProgress: async (update) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/progress/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const data = await response.json();
      set({ progress: data });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  },
  
  completeChapter: async (chapterId) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/progress/${deviceId}/complete-chapter/${chapterId}`, {
        method: 'POST',
      });
      const data = await response.json();
      set({ progress: data });
    } catch (error) {
      console.error('Failed to complete chapter:', error);
    }
  },
  
  createDailyLog: async (log) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      await fetch(`${API_URL}/api/daily-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, device_id: deviceId }),
      });
      await get().fetchDailyLogs();
    } catch (error) {
      console.error('Failed to create daily log:', error);
    }
  },
  
  fetchDailyLogs: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/daily-logs/${deviceId}`);
      const data = await response.json();
      set({ dailyLogs: data });
    } catch (error) {
      console.error('Failed to fetch daily logs:', error);
    }
  },
  
  createABCRecord: async (record) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      await fetch(`${API_URL}/api/abc-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, device_id: deviceId }),
      });
      await get().fetchABCRecords();
    } catch (error) {
      console.error('Failed to create ABC record:', error);
    }
  },
  
  fetchABCRecords: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/abc-records/${deviceId}`);
      const data = await response.json();
      set({ abcRecords: data });
    } catch (error) {
      console.error('Failed to fetch ABC records:', error);
    }
  },
  
  updateABCRecord: async (recordId, alternativeLabel, newIntensity) => {
    try {
      await fetch(`${API_URL}/api/abc-records/${recordId}?alternative_label=${encodeURIComponent(alternativeLabel)}&new_intensity=${newIntensity}`, {
        method: 'PUT',
      });
      await get().fetchABCRecords();
    } catch (error) {
      console.error('Failed to update ABC record:', error);
    }
  },
  
  createExposureLadder: async (steps) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/exposure-ladder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, steps }),
      });
      const data = await response.json();
      set({ exposureLadder: data });
    } catch (error) {
      console.error('Failed to create exposure ladder:', error);
    }
  },
  
  fetchExposureLadder: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/exposure-ladder/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        set({ exposureLadder: data });
      }
    } catch (error) {
      console.error('Failed to fetch exposure ladder:', error);
    }
  },
  
  addExposureAttempt: async (stepNumber, attempt) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/exposure-ladder/${deviceId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, step_number: stepNumber, ...attempt }),
      });
      const data = await response.json();
      set({ exposureLadder: data });
    } catch (error) {
      console.error('Failed to add exposure attempt:', error);
    }
  },
  
  addEmergencyKitItem: async (item) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      await fetch(`${API_URL}/api/emergency-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, device_id: deviceId }),
      });
      await get().fetchEmergencyKit();
    } catch (error) {
      console.error('Failed to add emergency kit item:', error);
    }
  },
  
  fetchEmergencyKit: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/emergency-kit/${deviceId}`);
      const data = await response.json();
      set({ emergencyKit: data });
    } catch (error) {
      console.error('Failed to fetch emergency kit:', error);
    }
  },
  
  deleteEmergencyKitItem: async (itemId) => {
    try {
      await fetch(`${API_URL}/api/emergency-kit/${itemId}`, {
        method: 'DELETE',
      });
      await get().fetchEmergencyKit();
    } catch (error) {
      console.error('Failed to delete emergency kit item:', error);
    }
  },
  
  submitQuestionnaire: async (response) => {
    const { deviceId } = get();
    if (!deviceId) return;
    
    try {
      await fetch(`${API_URL}/api/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...response, device_id: deviceId }),
      });
      await get().fetchQuestionnaireResponses();
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
    }
  },
  
  fetchQuestionnaireResponses: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      const response = await fetch(`${API_URL}/api/questionnaire/${deviceId}`);
      const data = await response.json();
      set({ questionnaireResponses: data });
    } catch (error) {
      console.error('Failed to fetch questionnaire responses:', error);
    }
  },

  // Factor Log Actions
  createFactorLog: async (log) => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      await fetch(`${API_URL}/api/factor-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, device_id: deviceId }),
      });
      await get().fetchFactorLogs();
    } catch (error) {
      console.error('Failed to create factor log:', error);
    }
  },

  fetchFactorLogs: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      const response = await fetch(`${API_URL}/api/factor-logs/${deviceId}`);
      const data = await response.json();
      set({ factorLogs: data });
    } catch (error) {
      console.error('Failed to fetch factor logs:', error);
    }
  },

  // Mindfulness Session Actions
  createMindfulnessSession: async (session) => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      await fetch(`${API_URL}/api/mindfulness-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, device_id: deviceId }),
      });
      await get().fetchMindfulnessSessions();
    } catch (error) {
      console.error('Failed to create mindfulness session:', error);
    }
  },

  fetchMindfulnessSessions: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      const response = await fetch(`${API_URL}/api/mindfulness-sessions/${deviceId}`);
      const data = await response.json();
      set({ mindfulnessSessions: data });
    } catch (error) {
      console.error('Failed to fetch mindfulness sessions:', error);
    }
  },

  // Settings Actions
  fetchSettings: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      const response = await fetch(`${API_URL}/api/settings/${deviceId}`);
      const data = await response.json();
      set({ settings: data });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  updateSettings: async (update) => {
    const { deviceId } = get();
    if (!deviceId) return;

    try {
      const response = await fetch(`${API_URL}/api/settings/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const data = await response.json();
      set({ settings: data });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
}));
