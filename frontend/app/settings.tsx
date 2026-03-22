import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';
import { COLORS } from '../src/utils/helpers';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function SettingsScreen() {
  const { settings, fetchSettings, updateSettings } = useAppStore();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setReminderEnabled(settings.reminder_enabled);
      const [h, m] = settings.reminder_time.split(':');
      setSelectedHour(h);
      setSelectedMinute(MINUTES.includes(m) ? m : '00');
      setVolume(settings.sound_masking_volume);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      reminder_enabled: reminderEnabled,
      reminder_time: `${selectedHour}:${selectedMinute}`,
      sound_masking_volume: volume,
    });
    Alert.alert('Guardado', 'Tu configuración ha sido actualizada.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* Recordatorios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordatorios</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Recordatorio diario</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={reminderEnabled ? COLORS.primary : COLORS.textLight}
            />
          </View>

          {reminderEnabled && (
            <View style={styles.timePickerSection}>
              <Text style={styles.formLabel}>Hora del recordatorio</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Hora</Text>
                  <ScrollView style={styles.timePicker} nestedScrollEnabled>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[styles.timeOption, selectedHour === h && styles.timeOptionActive]}
                        onPress={() => setSelectedHour(h)}
                      >
                        <Text style={[styles.timeOptionText, selectedHour === h && styles.timeOptionTextActive]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Min</Text>
                  <ScrollView style={styles.timePicker} nestedScrollEnabled>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.timeOption, selectedMinute === m && styles.timeOptionActive]}
                        onPress={() => setSelectedMinute(m)}
                      >
                        <Text style={[styles.timeOptionText, selectedMinute === m && styles.timeOptionTextActive]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <Text style={styles.selectedTime}>
                Seleccionado: {selectedHour}:{selectedMinute}
              </Text>
            </View>
          )}
        </View>

        {/* Enmascaramiento de sonido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enmascaramiento de Sonido</Text>
          <Text style={styles.sectionDescription}>
            Ajusta el volumen predeterminado para los sonidos de enmascaramiento.
          </Text>
          <View style={styles.volumeRow}>
            <Ionicons name="volume-low-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.volumeTrack}>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.volumeDot,
                    volume >= v && styles.volumeDotActive,
                  ]}
                  onPress={() => setVolume(v)}
                />
              ))}
            </View>
            <Ionicons name="volume-high-outline" size={20} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.volumeText}>{volume}%</Text>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Programa</Text>
            <Text style={styles.infoValue}>12 semanas CBT</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>

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
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.text,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  timePickerSection: {
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timePicker: {
    maxHeight: 120,
    width: 60,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  timeOption: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeOptionActive: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  timeOptionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  timeOptionTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  selectedTime: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  volumeDotActive: {
    backgroundColor: COLORS.primary,
  },
  volumeText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
