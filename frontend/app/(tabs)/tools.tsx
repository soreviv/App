import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { COLORS, getTodayString } from '../../src/utils/helpers';
import { EMOTIONS_LIST } from '../../src/data/programContent';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

export default function ToolsScreen() {
  const router = useRouter();
  const { createABCRecord, createDailyLog, deviceId } = useAppStore();
  const [showABCModal, setShowABCModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [replacementStep, setReplacementStep] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale' | 'done'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState<NodeJS.Timeout | null>(null);

  // ABC Form State
  const [abcForm, setAbcForm] = useState({
    situation: '',
    time: '',
    alarm_label: '',
    emotion: '',
    intensity: 5,
    action_taken: '',
  });

  const startBreathing = () => {
    setBreathingPhase('inhale');
    setBreathingCount(0);
    setShowBreathingModal(true);
    
    let count = 0;
    let phase: 'inhale' | 'exhale' = 'inhale';
    
    const timer = setInterval(() => {
      if (phase === 'inhale') {
        phase = 'exhale';
        setBreathingPhase('exhale');
      } else {
        phase = 'inhale';
        setBreathingPhase('inhale');
        count++;
        setBreathingCount(count);
        
        if (count >= 4) {
          clearInterval(timer);
          setBreathingPhase('done');
        }
      }
    }, 4000);
    
    setBreathingTimer(timer);
  };

  const stopBreathing = () => {
    if (breathingTimer) {
      clearInterval(breathingTimer);
    }
    setShowBreathingModal(false);
  };

  const handleABCSubmit = async () => {
    if (!abcForm.situation || !abcForm.alarm_label || !abcForm.emotion) {
      Alert.alert('Campos requeridos', 'Por favor completa la situación, etiqueta de alarma y emoción.');
      return;
    }

    await createABCRecord({
      date: getTodayString(),
      situation: abcForm.situation,
      time: abcForm.time || null,
      location: null,
      alarm_label: abcForm.alarm_label,
      emotion: abcForm.emotion,
      intensity: abcForm.intensity,
      action_taken: abcForm.action_taken || null,
      alternative_label: null,
      new_intensity: null,
    });

    setShowABCModal(false);
    setAbcForm({
      situation: '',
      time: '',
      alarm_label: '',
      emotion: '',
      intensity: 5,
      action_taken: '',
    });
    Alert.alert('¡Registrado!', 'Tu registro ABC ha sido guardado.');
  };

  const tools: Tool[] = [
    {
      id: 'breathing',
      title: 'Respiración 4-6',
      description: '4 ciclos de respiración diafragmática para calmar el sistema nervioso',
      icon: 'leaf-outline',
      color: COLORS.secondary,
      action: startBreathing,
    },
    {
      id: 'abc',
      title: 'Registro ABC',
      description: 'Mapea tu patrón de pánico (Activador → Etiqueta → Consecuencia)',
      icon: 'git-network-outline',
      color: COLORS.primary,
      action: () => setShowABCModal(true),
    },
    {
      id: 'mindfulness',
      title: 'Observación 3 Min',
      description: 'Ejercicio guiado de atención plena con temporizador',
      icon: 'eye-outline',
      color: '#9C27B0',
      action: () => router.push('/mindfulness'),
    },
    {
      id: 'replacement',
      title: 'Reemplazo Activo',
      description: 'Practica el ciclo: Pausa → Reemplaza → Redirige',
      icon: 'swap-horizontal-outline',
      color: '#FF9800',
      action: () => setShowReplacementModal(true),
    },
    {
      id: 'grounding',
      title: 'Anclaje 5-4-3-2-1',
      description: 'Técnica de conexión con el presente',
      icon: 'hand-left-outline',
      color: '#00BCD4',
      action: () => setShowGroundingModal(true),
    },
    {
      id: 'factors',
      title: 'Factores Agravantes',
      description: 'Registra sueño, cafeína, estrés y más',
      icon: 'analytics-outline',
      color: '#607D8B',
      action: () => router.push('/factors'),
    },
    {
      id: 'exposure',
      title: 'Mi Escalera',
      description: 'Ver y registrar mi escalera de exposición',
      icon: 'trending-up-outline',
      color: COLORS.success,
      action: () => router.push('/chapter/9'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Herramientas</Text>
          <Text style={styles.subtitle}>Ejercicios prácticos para el día a día</Text>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={tool.action}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '15' }]}>
                <Ionicons name={tool.icon} size={28} color={tool.color} />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Recuerda</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>El objetivo NO es silenciar el tinnitus</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>Cada práctica debilita la alarma cerebral</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>17 segundos es todo lo que necesitas</Text>
          </View>
        </View>
      </ScrollView>

      {/* Breathing Modal */}
      <Modal visible={showBreathingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.breathingModal}>
            <TouchableOpacity style={styles.closeButton} onPress={stopBreathing}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.breathingTitle}>Respiración 4-6</Text>
            
            <View style={[
              styles.breathingCircle,
              breathingPhase === 'inhale' && styles.breathingExpand,
              breathingPhase === 'exhale' && styles.breathingContract,
            ]}>
              <Text style={styles.breathingText}>
                {breathingPhase === 'inhale' ? 'INHALA' : 
                 breathingPhase === 'exhale' ? 'EXHALA' : '¡LISTO!'}
              </Text>
              <Text style={styles.breathingSubtext}>
                {breathingPhase === 'inhale' ? '4 segundos' : 
                 breathingPhase === 'exhale' ? '6 segundos' : 'Bien hecho'}
              </Text>
            </View>
            
            <Text style={styles.breathingCount}>
              {breathingPhase !== 'done' ? `Ciclo ${breathingCount + 1} de 4` : ''}
            </Text>
            
            {breathingPhase === 'done' && (
              <TouchableOpacity style={styles.doneButton} onPress={stopBreathing}>
                <Text style={styles.doneButtonText}>Terminar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* ABC Modal */}
      <Modal visible={showABCModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.abcModal}>
            <View style={styles.abcHeader}>
              <Text style={styles.abcTitle}>Registro ABC</Text>
              <TouchableOpacity onPress={() => setShowABCModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.abcForm}>
              <Text style={styles.formLabel}>A - Situación (Activador)*</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: En la cama, tratando de dormir"
                placeholderTextColor={COLORS.textLight}
                value={abcForm.situation}
                onChangeText={(text) => setAbcForm({...abcForm, situation: text})}
                multiline
              />
              
              <Text style={styles.formLabel}>Hora (opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 10:30 PM"
                placeholderTextColor={COLORS.textLight}
                value={abcForm.time}
                onChangeText={(text) => setAbcForm({...abcForm, time: text})}
              />
              
              <Text style={styles.formLabel}>B - Etiqueta de Alarma*</Text>
              <TextInput
                style={styles.textInput}
                placeholder="¿Qué pensamiento automático apareció?"
                placeholderTextColor={COLORS.textLight}
                value={abcForm.alarm_label}
                onChangeText={(text) => setAbcForm({...abcForm, alarm_label: text})}
                multiline
              />
              
              <Text style={styles.formLabel}>C - Emoción*</Text>
              <View style={styles.emotionGrid}>
                {EMOTIONS_LIST.map((emotion) => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionChip,
                      abcForm.emotion === emotion && styles.emotionChipActive,
                    ]}
                    onPress={() => setAbcForm({...abcForm, emotion})}
                  >
                    <Text style={[
                      styles.emotionChipText,
                      abcForm.emotion === emotion && styles.emotionChipTextActive,
                    ]}>
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.formLabel}>Intensidad (0-10): {abcForm.intensity}</Text>
              <View style={styles.intensityRow}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.intensityDot,
                      abcForm.intensity === level && styles.intensityDotActive,
                    ]}
                    onPress={() => setAbcForm({...abcForm, intensity: level})}
                  >
                    <Text style={[
                      styles.intensityText,
                      abcForm.intensity === level && styles.intensityTextActive,
                    ]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.formLabel}>¿Qué hiciste? (opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Cerré el libro y me fui a ver TV"
                placeholderTextColor={COLORS.textLight}
                value={abcForm.action_taken}
                onChangeText={(text) => setAbcForm({...abcForm, action_taken: text})}
                multiline
              />
            </ScrollView>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleABCSubmit}>
              <Text style={styles.submitButtonText}>Guardar Registro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Replacement Modal */}
      <Modal visible={showReplacementModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.breathingModal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowReplacementModal(false); setReplacementStep(0); }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.breathingTitle}>Reemplazo Activo</Text>
            <Text style={styles.replacementSubtitle}>17 segundos</Text>

            {replacementStep === 0 && (
              <View style={styles.replacementContent}>
                <View style={[styles.replacementIcon, { backgroundColor: '#FF980020' }]}>
                  <Ionicons name="pause-outline" size={40} color="#FF9800" />
                </View>
                <Text style={styles.replacementStepTitle}>1. PAUSA</Text>
                <Text style={styles.replacementStepDesc}>"Ahí está mi Etiqueta de Alarma vieja"</Text>
                <Text style={styles.replacementTime}>2 segundos</Text>
              </View>
            )}
            {replacementStep === 1 && (
              <View style={styles.replacementContent}>
                <View style={[styles.replacementIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="swap-horizontal-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.replacementStepTitle}>2. REEMPLAZA</Text>
                <Text style={styles.replacementStepDesc}>Di tu Etiqueta Alternativa en voz alta o mental</Text>
                <Text style={styles.replacementTime}>5 segundos</Text>
              </View>
            )}
            {replacementStep === 2 && (
              <View style={styles.replacementContent}>
                <View style={[styles.replacementIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <Ionicons name="arrow-forward-outline" size={40} color={COLORS.success} />
                </View>
                <Text style={styles.replacementStepTitle}>3. REDIRIGE</Text>
                <Text style={styles.replacementStepDesc}>Vuelve a lo que estabas haciendo</Text>
                <Text style={styles.replacementTime}>10 segundos</Text>
              </View>
            )}

            <View style={styles.replacementNav}>
              {replacementStep > 0 && (
                <TouchableOpacity style={styles.navButton} onPress={() => setReplacementStep(replacementStep - 1)}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
                  <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}
              {replacementStep < 2 ? (
                <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={() => setReplacementStep(replacementStep + 1)}>
                  <Text style={styles.navButtonTextPrimary}>Siguiente</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.doneButton} onPress={() => { setShowReplacementModal(false); setReplacementStep(0); }}>
                  <Text style={styles.doneButtonText}>¡Listo!</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Grounding Modal */}
      <Modal visible={showGroundingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.breathingModal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowGroundingModal(false); setGroundingStep(0); }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.breathingTitle}>Anclaje 5-4-3-2-1</Text>

            {[
              { count: 5, sense: 'VER', icon: 'eye-outline' as const, color: '#2196F3' },
              { count: 4, sense: 'TOCAR', icon: 'hand-left-outline' as const, color: '#4CAF50' },
              { count: 3, sense: 'OÍR', icon: 'ear-outline' as const, color: '#FF9800' },
              { count: 2, sense: 'OLER', icon: 'flower-outline' as const, color: '#9C27B0' },
              { count: 1, sense: 'SABOREAR', icon: 'restaurant-outline' as const, color: '#F44336' },
            ].map((item, i) => (
              groundingStep === i && (
                <View key={i} style={styles.replacementContent}>
                  <View style={[styles.replacementIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={40} color={item.color} />
                  </View>
                  <Text style={styles.replacementStepTitle}>{item.count} cosas que puedes {item.sense}</Text>
                  <Text style={styles.replacementStepDesc}>Nombra cada una en voz alta o mentalmente</Text>
                  <Text style={[styles.groundingProgress]}>Paso {i + 1} de 5</Text>
                </View>
              )
            ))}

            <View style={styles.replacementNav}>
              {groundingStep > 0 && (
                <TouchableOpacity style={styles.navButton} onPress={() => setGroundingStep(groundingStep - 1)}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
                  <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}
              {groundingStep < 4 ? (
                <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={() => setGroundingStep(groundingStep + 1)}>
                  <Text style={styles.navButtonTextPrimary}>Siguiente</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.doneButton} onPress={() => { setShowGroundingModal(false); setGroundingStep(0); }}>
                  <Text style={styles.doneButtonText}>¡Listo!</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  toolsGrid: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  toolCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  toolDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  breathingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 32,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  breathingExpand: {
    transform: [{ scale: 1.1 }],
  },
  breathingContract: {
    transform: [{ scale: 0.9 }],
  },
  breathingText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  breathingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  breathingCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 24,
  },
  doneButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  doneButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  abcModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    position: 'absolute',
    bottom: 0,
  },
  abcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  abcTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  abcForm: {
    padding: 20,
    maxHeight: 400,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 48,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emotionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emotionChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emotionChipTextActive: {
    color: COLORS.surface,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  intensityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intensityDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intensityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  intensityTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  replacementSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: -8,
    marginBottom: 16,
  },
  replacementContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  replacementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  replacementStepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  replacementStepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  replacementTime: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 12,
  },
  groundingProgress: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 12,
  },
  replacementNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  navButtonTextPrimary: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '500',
  },
});
