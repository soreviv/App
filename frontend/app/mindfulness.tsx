import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';
import { COLORS, getTodayString, formatDate } from '../src/utils/helpers';

type TimerState = 'idle' | 'running' | 'done';

export default function MindfulnessScreen() {
  const { mindfulnessSessions, createMindfulnessSession, fetchMindfulnessSessions } = useAppStore();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes
  const [currentPhase, setCurrentPhase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Post-session form
  const [showForm, setShowForm] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'night'>('morning');
  const [difficulty, setDifficulty] = useState(5);
  const [observation, setObservation] = useState('');

  const phases = [
    { label: 'Observa tu respiración', icon: 'leaf-outline' as const, duration: 60 },
    { label: 'Observa el tinnitus sin juzgar', icon: 'ear-outline' as const, duration: 60 },
    { label: 'Expande tu atención', icon: 'expand-outline' as const, duration: 60 },
  ];

  useEffect(() => {
    fetchMindfulnessSessions();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    setTimerState('running');
    setSecondsLeft(180);
    setCurrentPhase(0);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState('done');
          setShowForm(true);
          return 0;
        }
        const elapsed = 180 - prev + 1;
        if (elapsed === 60) setCurrentPhase(1);
        if (elapsed === 120) setCurrentPhase(2);
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('idle');
    setSecondsLeft(180);
    setCurrentPhase(0);
  };

  const handleSaveSession = async () => {
    await createMindfulnessSession({
      date: getTodayString(),
      time_of_day: timeOfDay,
      completed: timerState === 'done',
      difficulty_level: difficulty,
      observation: observation || null,
    });
    setShowForm(false);
    setTimerState('idle');
    setSecondsLeft(180);
    setCurrentPhase(0);
    setObservation('');
    setDifficulty(5);
    Alert.alert('¡Sesión guardada!', 'Tu práctica de mindfulness ha sido registrada.');
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mindfulness</Text>
          <Text style={styles.subtitle}>Observación consciente de 3 minutos</Text>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            {timerState === 'running' && (
              <Text style={styles.timerPhase}>{phases[currentPhase].label}</Text>
            )}
            {timerState === 'idle' && (
              <Text style={styles.timerPhase}>Toca para iniciar</Text>
            )}
            {timerState === 'done' && (
              <Text style={styles.timerPhase}>¡Completado!</Text>
            )}
          </View>

          {/* Phase indicators */}
          <View style={styles.phasesRow}>
            {phases.map((phase, i) => (
              <View key={i} style={styles.phaseItem}>
                <View style={[
                  styles.phaseIcon,
                  currentPhase === i && timerState === 'running' && styles.phaseIconActive,
                  i < currentPhase && styles.phaseIconDone,
                ]}>
                  <Ionicons
                    name={phase.icon}
                    size={18}
                    color={
                      currentPhase === i && timerState === 'running' ? COLORS.surface :
                      i < currentPhase ? COLORS.surface : COLORS.textLight
                    }
                  />
                </View>
                <Text style={[
                  styles.phaseLabel,
                  currentPhase === i && timerState === 'running' && styles.phaseLabelActive,
                ]}>{i + 1}. {phase.label}</Text>
              </View>
            ))}
          </View>

          {timerState === 'idle' && (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Ionicons name="play" size={20} color={COLORS.surface} />
              <Text style={styles.startButtonText}>Comenzar</Text>
            </TouchableOpacity>
          )}
          {timerState === 'running' && (
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Ionicons name="stop" size={20} color={COLORS.surface} />
              <Text style={styles.stopButtonText}>Detener</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Post-session form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>¿Cómo fue tu sesión?</Text>

            <Text style={styles.formLabel}>Momento del día</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, timeOfDay === 'morning' && styles.toggleActive]}
                onPress={() => setTimeOfDay('morning')}
              >
                <Ionicons name="sunny-outline" size={18} color={timeOfDay === 'morning' ? COLORS.surface : COLORS.textSecondary} />
                <Text style={[styles.toggleText, timeOfDay === 'morning' && styles.toggleTextActive]}>Mañana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, timeOfDay === 'night' && styles.toggleActive]}
                onPress={() => setTimeOfDay('night')}
              >
                <Ionicons name="moon-outline" size={18} color={timeOfDay === 'night' ? COLORS.surface : COLORS.textSecondary} />
                <Text style={[styles.toggleText, timeOfDay === 'night' && styles.toggleTextActive]}>Noche</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Dificultad (1-10): {difficulty}</Text>
            <View style={styles.levelRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelDot, difficulty === level && styles.levelDotActive]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[styles.levelText, difficulty === level && styles.levelTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Observación (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={observation}
              onChangeText={setObservation}
              placeholder="¿Qué notaste durante la práctica?"
              placeholderTextColor={COLORS.textLight}
              multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSession}>
              <Text style={styles.saveButtonText}>Guardar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Sesiones Anteriores</Text>
        </View>

        {mindfulnessSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Sin sesiones registradas</Text>
            <Text style={styles.emptySubtext}>Completa tu primera sesión de 3 minutos</Text>
          </View>
        ) : (
          mindfulnessSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionLeft}>
                  <Ionicons
                    name={session.time_of_day === 'morning' ? 'sunny-outline' : 'moon-outline'}
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Ionicons
                    name={session.completed ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={session.completed ? COLORS.success : COLORS.error}
                  />
                  <Text style={styles.difficultyBadge}>Dif: {session.difficulty_level}</Text>
                </View>
              </View>
              {session.observation && (
                <Text style={styles.sessionObservation}>{session.observation}</Text>
              )}
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timerCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timerPhase: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  phasesRow: {
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseIconActive: {
    backgroundColor: COLORS.primary,
  },
  phaseIconDone: {
    backgroundColor: COLORS.success,
  },
  phaseLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  phaseLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  startButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  stopButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  levelTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 60,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  historyHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  difficultyBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sessionObservation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
