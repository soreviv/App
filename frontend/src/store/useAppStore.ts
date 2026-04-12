import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DailyLog, ABCRecord, ExposureLadder, EmergencyKitItem, QuestionnaireResponse, FactorLog, MindfulnessSession, UserSettings } from '../types';
import { scheduleDailyReminder, cancelAllReminders } from '../utils/notifications';
import { offlineFetch, flushQueue } from '../utils/offlineSync';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface AppState {
  // Device ID
  deviceId: string | null;
  isLoading: boolean;
  pendingSyncs: number;

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

  // Factor Logs
  factorLogs: FactorLog[];

  // Mindfulness Sessions
  mindfulnessSessions: MindfulnessSession[];

  // Settings
  settings: UserSettings | null;

  // Actions
  initialize: () => Promise<void>;
  syncPending: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  updateProgress: (update: Partial<UserProgress>) => Promise<void>;
  completeChapter: (chapterId: number) => Promise<void>;

  createDailyLog: (log: Omit<DailyLog, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchDailyLogs: () => Promise<void>;

  createABCRecord: (record: Omit<ABCRecord, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchABCRecords: () => Promise<void>;
  updateABCRecord: (recordId: string, alternativeLabel: string, newIntensity: number) => Promise<void>;

  createExposureLadder: (steps: any[]) => Promise<void>;
  fetchExposureLadder: () => Promise<void>;
  addExposureAttempt: (stepNumber: number, attempt: any) => Promise<void>;

  addEmergencyKitItem: (item: Omit<EmergencyKitItem, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchEmergencyKit: () => Promise<void>;
  deleteEmergencyKitItem: (itemId: string) => Promise<void>;

  submitQuestionnaire: (response: Omit<QuestionnaireResponse, 'id' | 'device_id' | 'total_score' | 'created_at'>) => Promise<void>;
  fetchQuestionnaireResponses: () => Promise<void>;

  createFactorLog: (log: Omit<FactorLog, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchFactorLogs: () => Promise<void>;

  createMindfulnessSession: (session: Omit<MindfulnessSession, 'id' | 'device_id' | 'created_at'>) => Promise<void>;
  fetchMindfulnessSessions: () => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (update: Partial<UserSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  deviceId: null,
  isLoading: true,
  pendingSyncs: 0,
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
      set({ deviceId });

      // Flush any pending sync queue from previous offline session
      await get().syncPending();

      // Fetch initial data (all offline-aware with cache)
      await get().fetchProgress();
      await get().fetchDailyLogs();
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

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isLoading: false });
    }
  },

  syncPending: async () => {
    const { synced, failed } = await flushQueue();
    set({ pendingSyncs: failed });
    if (synced > 0) {
      // Refresh data after syncing
      await get().fetchDailyLogs();
      await get().fetchABCRecords();
      await get().fetchEmergencyKit();
      await get().fetchFactorLogs();
      await get().fetchMindfulnessSessions();
    }
  },

  // ============ PROGRESS ============

  fetchProgress: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<UserProgress>({
      url: `${API_URL}/api/progress`,
      method: 'POST',
      body: { device_id: deviceId },
      cacheKey: `progress:${deviceId}`,
    });
    if (data) set({ progress: data });
  },

  updateProgress: async (update) => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<UserProgress>({
      url: `${API_URL}/api/progress/${deviceId}`,
      method: 'PUT',
      body: update,
    });
    if (data) set({ progress: data });
  },

  completeChapter: async (chapterId) => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<UserProgress>({
      url: `${API_URL}/api/progress/${deviceId}/complete-chapter/${chapterId}`,
      method: 'POST',
    });
    if (data) set({ progress: data });
  },

  // ============ DAILY LOGS ============

  createDailyLog: async (log) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/daily-logs`,
      method: 'POST',
      body: { ...log, device_id: deviceId },
    });
    await get().fetchDailyLogs();
  },

  fetchDailyLogs: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<DailyLog[]>({
      url: `${API_URL}/api/daily-logs/${deviceId}`,
      cacheKey: `daily-logs:${deviceId}`,
    });
    if (data) set({ dailyLogs: data });
  },

  // ============ ABC RECORDS ============

  createABCRecord: async (record) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/abc-records`,
      method: 'POST',
      body: { ...record, device_id: deviceId },
    });
    await get().fetchABCRecords();
  },

  fetchABCRecords: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<ABCRecord[]>({
      url: `${API_URL}/api/abc-records/${deviceId}`,
      cacheKey: `abc-records:${deviceId}`,
    });
    if (data) set({ abcRecords: data });
  },

  updateABCRecord: async (recordId, alternativeLabel, newIntensity) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/abc-records/${recordId}`,
      method: 'PUT',
      body: {
        device_id: deviceId,
        alternative_label: alternativeLabel,
        new_intensity: newIntensity
      },
    });
    await get().fetchABCRecords();
  },

  // ============ EXPOSURE LADDER ============

  createExposureLadder: async (steps) => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<ExposureLadder>({
      url: `${API_URL}/api/exposure-ladder`,
      method: 'POST',
      body: { device_id: deviceId, steps },
    });
    if (data) set({ exposureLadder: data });
  },

  fetchExposureLadder: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<ExposureLadder>({
      url: `${API_URL}/api/exposure-ladder/${deviceId}`,
      cacheKey: `exposure-ladder:${deviceId}`,
    });
    if (data) set({ exposureLadder: data });
  },

  addExposureAttempt: async (stepNumber, attempt) => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<ExposureLadder>({
      url: `${API_URL}/api/exposure-ladder/${deviceId}/attempt`,
      method: 'POST',
      body: { device_id: deviceId, step_number: stepNumber, ...attempt },
    });
    if (data) set({ exposureLadder: data });
  },

  // ============ EMERGENCY KIT ============

  addEmergencyKitItem: async (item) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/emergency-kit`,
      method: 'POST',
      body: { ...item, device_id: deviceId },
    });
    await get().fetchEmergencyKit();
  },

  fetchEmergencyKit: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<EmergencyKitItem[]>({
      url: `${API_URL}/api/emergency-kit/${deviceId}`,
      cacheKey: `emergency-kit:${deviceId}`,
    });
    if (data) set({ emergencyKit: data });
  },

  deleteEmergencyKitItem: async (itemId) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/emergency-kit/${itemId}?device_id=${encodeURIComponent(deviceId)}`,
      method: 'DELETE',
    });
    await get().fetchEmergencyKit();
  },

  // ============ QUESTIONNAIRE ============

  submitQuestionnaire: async (response) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/questionnaire`,
      method: 'POST',
      body: { ...response, device_id: deviceId },
    });
    await get().fetchQuestionnaireResponses();
  },

  fetchQuestionnaireResponses: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<QuestionnaireResponse[]>({
      url: `${API_URL}/api/questionnaire/${deviceId}`,
      cacheKey: `questionnaire:${deviceId}`,
    });
    if (data) set({ questionnaireResponses: data });
  },

  // ============ FACTOR LOGS ============

  createFactorLog: async (log) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/factor-logs`,
      method: 'POST',
      body: { ...log, device_id: deviceId },
    });
    await get().fetchFactorLogs();
  },

  fetchFactorLogs: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<FactorLog[]>({
      url: `${API_URL}/api/factor-logs/${deviceId}`,
      cacheKey: `factor-logs:${deviceId}`,
    });
    if (data) set({ factorLogs: data });
  },

  // ============ MINDFULNESS SESSIONS ============

  createMindfulnessSession: async (session) => {
    const { deviceId } = get();
    if (!deviceId) return;

    await offlineFetch({
      url: `${API_URL}/api/mindfulness-sessions`,
      method: 'POST',
      body: { ...session, device_id: deviceId },
    });
    await get().fetchMindfulnessSessions();
  },

  fetchMindfulnessSessions: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<MindfulnessSession[]>({
      url: `${API_URL}/api/mindfulness-sessions/${deviceId}`,
      cacheKey: `mindfulness-sessions:${deviceId}`,
    });
    if (data) set({ mindfulnessSessions: data });
  },

  // ============ SETTINGS ============

  fetchSettings: async () => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<UserSettings>({
      url: `${API_URL}/api/settings/${deviceId}`,
      cacheKey: `settings:${deviceId}`,
    });
    if (data) set({ settings: data });
  },

  updateSettings: async (update) => {
    const { deviceId } = get();
    if (!deviceId) return;

    const data = await offlineFetch<UserSettings>({
      url: `${API_URL}/api/settings/${deviceId}`,
      method: 'PUT',
      body: update,
    });
    if (data) set({ settings: data });
  },
}));
