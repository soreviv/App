import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { PROGRAM_WEEKS } from '../../src/data/programContent';
import { COLORS, getProgressPercentage, getTodayString, formatDate } from '../../src/utils/helpers';

export default function HomeScreen() {
  const router = useRouter();
  const { initialize, isLoading, progress, dailyLogs, createDailyLog, fetchDailyLogs } = useAppStore();
  const [todayDistress, setTodayDistress] = useState<number | null>(null);
  const [showDistressInput, setShowDistressInput] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const doInit = async () => {
      try {
        await initialize();
      } catch (e: any) {
        console.error('Init error:', e);
        setInitError(e.message);
      }
    };
    doInit();
  }, []);

  useEffect(() => {
    const todayLog = dailyLogs.find(log => log.date === getTodayString());
    if (todayLog) {
      setTodayDistress(todayLog.distress_level);
    }
  }, [dailyLogs]);

  const handleDistressLog = async (level: number) => {
    await createDailyLog({
      date: getTodayString(),
      distress_level: level,
      reflection: null,
      exercises_completed: [],
      sleep_quality: null,
      notes: null,
    });
    setTodayDistress(level);
    setShowDistressInput(false);
  };

  if (initError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error: {initError}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  const currentWeek = progress?.current_week || 1;
  const completedChapters = progress?.chapters_completed || [];
  const overallProgress = getProgressPercentage(completedChapters);

  const currentWeekData = PROGRAM_WEEKS.find(w => w.id === currentWeek);
  const nextChapter = currentWeekData?.chapters.find(
    c => !completedChapters.includes(c.id)
  ) || currentWeekData?.chapters[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Tu Camino Hacia la Libertad</Text>
              <Text style={styles.subtitle}>Programa de Habituación al Tinnitus</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{currentWeekData?.title}</Text>
            <Text style={styles.progressPart}>{currentWeekData?.part}</Text>
          </View>
          <Text style={styles.progressSubtitle}>{currentWeekData?.partTitle}</Text>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{overallProgress}% completado del programa</Text>

          {nextChapter && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push(`/chapter/${nextChapter.id}`)}
            >
              <View style={styles.continueContent}>
                <Ionicons name="book-outline" size={20} color={COLORS.surface} />
                <View style={styles.continueText}>
                  <Text style={styles.continueLabel}>Continuar con</Text>
                  <Text style={styles.continueTitle}>{nextChapter.title}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Distress Tracker */}
        <View style={styles.distressCard}>
          <View style={styles.distressHeader}>
            <View style={styles.distressHeaderLeft}>
              <Ionicons name="pulse-outline" size={24} color={COLORS.primary} />
              <Text style={styles.distressTitle}>Registro Diario</Text>
            </View>
            <Text style={styles.distressDate}>{formatDate(new Date())}</Text>
          </View>

          {!showDistressInput && todayDistress === null ? (
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => setShowDistressInput(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.logButtonText}>Registrar nivel de molestia</Text>
            </TouchableOpacity>
          ) : showDistressInput ? (
            <View style={styles.distressInputContainer}>
              <Text style={styles.distressQuestion}>¿Cuánto te molesta el tinnitus ahora? (0-10)</Text>
              <View style={styles.distressScale}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.distressLevel,
                      level <= 3 && styles.distressLow,
                      level > 3 && level <= 6 && styles.distressMedium,
                      level > 6 && styles.distressHigh,
                    ]}
                    onPress={() => handleDistressLog(level)}
                  >
                    <Text style={styles.distressLevelText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.todayLog}>
              <Text style={styles.todayLogLabel}>Nivel de hoy:</Text>
              <View style={[
                styles.todayLogValue,
                todayDistress !== null && todayDistress <= 3 && styles.distressLow,
                todayDistress !== null && todayDistress > 3 && todayDistress <= 6 && styles.distressMedium,
                todayDistress !== null && todayDistress > 6 && styles.distressHigh,
              ]}>
                <Text style={styles.todayLogValueText}>{todayDistress}/10</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDistressInput(true)}>
                <Text style={styles.editLink}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/program')}
            >
              <Ionicons name="list-outline" size={28} color={COLORS.primary} />
              <Text style={styles.actionText}>Ver Programa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/tools')}
            >
              <Ionicons name="fitness-outline" size={28} color={COLORS.secondary} />
              <Text style={styles.actionText}>Ejercicios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/emergency')}
            >
              <Ionicons name="medkit-outline" size={28} color={COLORS.error} />
              <Text style={styles.actionText}>Kit Emergencia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/progress')}
            >
              <Ionicons name="trending-up-outline" size={28} color={COLORS.success} />
              <Text style={styles.actionText}>Mi Progreso</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Recordatorio Diario</Text>
            <Text style={styles.reminderText}>
              La habituación toma tiempo. Cada día que practicas, tu cerebro se acerca más a reclasificar el tinnitus como "sonido neutro".
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingsButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPart: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  continueText: {
    marginLeft: 12,
  },
  continueLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  distressCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  distressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  distressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  distressDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  logButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  distressInputContainer: {
    alignItems: 'center',
  },
  distressQuestion: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  distressScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  distressLevel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  distressLow: {
    backgroundColor: '#C8E6C9',
  },
  distressMedium: {
    backgroundColor: '#FFF3CD',
  },
  distressHigh: {
    backgroundColor: '#FFCDD2',
  },
  distressLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  todayLog: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLogLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  todayLogValue: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayLogValueText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  editLink: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 12,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 8,
    fontWeight: '500',
  },
  reminderCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reminderText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
