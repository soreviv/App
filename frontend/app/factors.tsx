import React, { useEffect, useState } from 'react';
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

export default function FactorsScreen() {
  const { factorLogs, createFactorLog, fetchFactorLogs } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tinnitus_level: 5,
    sleep_hours: '',
    caffeine_cups: '',
    alcohol_drinks: '',
    stress_level: 5,
    exercise_minutes: '',
    notes: '',
  });

  useEffect(() => {
    fetchFactorLogs();
  }, []);

  const handleSubmit = async () => {
    await createFactorLog({
      date: getTodayString(),
      tinnitus_level: form.tinnitus_level,
      sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : null,
      caffeine_cups: form.caffeine_cups ? parseInt(form.caffeine_cups) : null,
      alcohol_drinks: form.alcohol_drinks ? parseInt(form.alcohol_drinks) : null,
      stress_level: form.stress_level,
      exercise_minutes: form.exercise_minutes ? parseInt(form.exercise_minutes) : null,
      notes: form.notes || null,
    });
    setShowForm(false);
    setForm({
      tinnitus_level: 5,
      sleep_hours: '',
      caffeine_cups: '',
      alcohol_drinks: '',
      stress_level: 5,
      exercise_minutes: '',
      notes: '',
    });
    Alert.alert('¡Registrado!', 'Tu registro de factores ha sido guardado.');
  };

  const getLevelColor = (level: number) => {
    if (level <= 3) return COLORS.success;
    if (level <= 6) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Factores Agravantes</Text>
          <Text style={styles.subtitle}>Registra los factores que pueden influir en tu tinnitus</Text>
        </View>

        {!showForm ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.surface} />
            <Text style={styles.addButtonText}>Registrar Hoy</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Registro de Hoy</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Tinnitus Level */}
            <Text style={styles.formLabel}>Nivel de tinnitus (0-10): {form.tinnitus_level}</Text>
            <View style={styles.levelRow}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelDot,
                    form.tinnitus_level === level && {
                      backgroundColor: getLevelColor(level),
                      borderColor: getLevelColor(level),
                    },
                  ]}
                  onPress={() => setForm({ ...form, tinnitus_level: level })}
                >
                  <Text style={[
                    styles.levelText,
                    form.tinnitus_level === level && styles.levelTextActive,
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stress Level */}
            <Text style={styles.formLabel}>Nivel de estrés (0-10): {form.stress_level}</Text>
            <View style={styles.levelRow}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelDot,
                    form.stress_level === level && {
                      backgroundColor: getLevelColor(level),
                      borderColor: getLevelColor(level),
                    },
                  ]}
                  onPress={() => setForm({ ...form, stress_level: level })}
                >
                  <Text style={[
                    styles.levelText,
                    form.stress_level === level && styles.levelTextActive,
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Numeric inputs */}
            <View style={styles.inputGrid}>
              <View style={styles.inputItem}>
                <Ionicons name="moon-outline" size={18} color={COLORS.primary} />
                <Text style={styles.inputLabel}>Horas de sueño</Text>
                <TextInput
                  style={styles.numberInput}
                  value={form.sleep_hours}
                  onChangeText={(t) => setForm({ ...form, sleep_hours: t })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.inputItem}>
                <Ionicons name="cafe-outline" size={18} color="#795548" />
                <Text style={styles.inputLabel}>Tazas de café</Text>
                <TextInput
                  style={styles.numberInput}
                  value={form.caffeine_cups}
                  onChangeText={(t) => setForm({ ...form, caffeine_cups: t })}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.inputItem}>
                <Ionicons name="wine-outline" size={18} color="#9C27B0" />
                <Text style={styles.inputLabel}>Bebidas alcohólicas</Text>
                <TextInput
                  style={styles.numberInput}
                  value={form.alcohol_drinks}
                  onChangeText={(t) => setForm({ ...form, alcohol_drinks: t })}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.inputItem}>
                <Ionicons name="fitness-outline" size={18} color={COLORS.success} />
                <Text style={styles.inputLabel}>Min. de ejercicio</Text>
                <TextInput
                  style={styles.numberInput}
                  value={form.exercise_minutes}
                  onChangeText={(t) => setForm({ ...form, exercise_minutes: t })}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.formLabel}>Notas (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={form.notes}
              onChangeText={(t) => setForm({ ...form, notes: t })}
              placeholder="¿Algo más que quieras anotar?"
              placeholderTextColor={COLORS.textLight}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Guardar Registro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Historial</Text>
        </View>

        {factorLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aún no hay registros</Text>
            <Text style={styles.emptySubtext}>Registra tus factores diarios para descubrir patrones</Text>
          </View>
        ) : (
          factorLogs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(log.tinnitus_level) + '20' }]}>
                  <Text style={[styles.levelBadgeText, { color: getLevelColor(log.tinnitus_level) }]}>
                    Tinnitus: {log.tinnitus_level}/10
                  </Text>
                </View>
              </View>
              <View style={styles.logFactors}>
                {log.sleep_hours != null && (
                  <View style={styles.factorChip}>
                    <Ionicons name="moon-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.factorText}>{log.sleep_hours}h sueño</Text>
                  </View>
                )}
                {log.stress_level != null && (
                  <View style={styles.factorChip}>
                    <Ionicons name="flash-outline" size={14} color={COLORS.warning} />
                    <Text style={styles.factorText}>Estrés: {log.stress_level}</Text>
                  </View>
                )}
                {log.caffeine_cups != null && (
                  <View style={styles.factorChip}>
                    <Ionicons name="cafe-outline" size={14} color="#795548" />
                    <Text style={styles.factorText}>{log.caffeine_cups} cafés</Text>
                  </View>
                )}
                {log.alcohol_drinks != null && (
                  <View style={styles.factorChip}>
                    <Ionicons name="wine-outline" size={14} color="#9C27B0" />
                    <Text style={styles.factorText}>{log.alcohol_drinks} bebidas</Text>
                  </View>
                )}
                {log.exercise_minutes != null && (
                  <View style={styles.factorChip}>
                    <Ionicons name="fitness-outline" size={14} color={COLORS.success} />
                    <Text style={styles.factorText}>{log.exercise_minutes} min</Text>
                  </View>
                )}
              </View>
              {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
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
  addButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
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
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  levelText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  levelTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  inputItem: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  numberInput: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    padding: 0,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 60,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
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
  logCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  factorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logNotes: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
