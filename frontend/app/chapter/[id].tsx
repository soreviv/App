import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { PROGRAM_WEEKS, CHAPTER_CONTENT, DISTRESS_QUESTIONS } from '../../src/data/programContent';
import { COLORS, isChapterUnlocked, getTodayString } from '../../src/utils/helpers';

export default function ChapterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapterId = parseInt(id || '1', 10);
  
  const { progress, completeChapter, submitQuestionnaire } = useAppStore();
  const completedChapters = progress?.chapters_completed || [];
  
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, number>>({});

  // Find chapter info
  const chapter = PROGRAM_WEEKS
    .flatMap(w => w.chapters)
    .find(c => c.id === chapterId);
  
  const content = CHAPTER_CONTENT[chapterId];
  const isUnlocked = isChapterUnlocked(chapterId, completedChapters);
  const isCompleted = completedChapters.includes(chapterId);

  // Find next chapter
  const allChapters = PROGRAM_WEEKS.flatMap(w => w.chapters);
  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const nextChapter = allChapters[currentIndex + 1];

  const handleComplete = async () => {
    // Chapter 2 requires questionnaire
    if (chapterId === 2 && !progress?.initial_distress_score) {
      setShowQuestionnaireModal(true);
      return;
    }

    await completeChapter(chapterId);
    
    if (nextChapter) {
      Alert.alert(
        '¡Excelente!',
        `Has completado "${chapter?.title}". ¿Quieres continuar con el siguiente capítulo?`,
        [
          { text: 'Después', style: 'cancel' },
          { text: 'Continuar', onPress: () => router.replace(`/chapter/${nextChapter.id}`) },
        ]
      );
    } else {
      Alert.alert('¡Felicidades!', 'Has completado el programa de 8 semanas.');
    }
  };

  const handleQuestionnaireSubmit = async () => {
    const allAnswered = DISTRESS_QUESTIONS.every(q => questionnaireAnswers[q.key] !== undefined);
    if (!allAnswered) {
      Alert.alert('Incompleto', 'Por favor responde todas las preguntas.');
      return;
    }

    await submitQuestionnaire({
      date: getTodayString(),
      week_number: 1,
      sleep_difficulty: questionnaireAnswers.sleep_difficulty,
      concentration_interference: questionnaireAnswers.concentration_interference,
      frustration_anger: questionnaireAnswers.frustration_anger,
      social_impact: questionnaireAnswers.social_impact,
      future_worry: questionnaireAnswers.future_worry,
      relaxation_difficulty: questionnaireAnswers.relaxation_difficulty,
      overwhelm_despair: questionnaireAnswers.overwhelm_despair,
    });

    setShowQuestionnaireModal(false);
    await completeChapter(chapterId);
    
    const totalScore = Object.values(questionnaireAnswers).reduce((a, b) => a + b, 0);
    Alert.alert(
      'Cuestionario Guardado',
      `Tu puntuación inicial: ${totalScore}/28\n\nEsta será tu línea base para medir tu progreso.`,
      [{ text: 'Continuar', onPress: () => nextChapter && router.replace(`/chapter/${nextChapter.id}`) }]
    );
  };

  if (!chapter || !content) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Capítulo no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={48} color={COLORS.textLight} />
          <Text style={styles.lockedTitle}>Capítulo Bloqueado</Text>
          <Text style={styles.lockedText}>
            Completa el capítulo anterior para desbloquear este contenido.
          </Text>
          <TouchableOpacity style={styles.backButtonLocked} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver al programa</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.chapterNumber}>Capítulo {chapterId}</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={12} color={COLORS.surface} />
                <Text style={styles.completedText}>Completado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title Card */}
        <View style={styles.titleCard}>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.subtitle}>{chapter.subtitle}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.duration}>{chapter.duration}</Text>
          </View>
        </View>

        {/* Content Sections */}
        {content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Exercises Section */}
        {chapter.exercises.length > 0 && (
          <View style={styles.exercisesCard}>
            <View style={styles.exercisesHeader}>
              <Ionicons name="fitness-outline" size={20} color={COLORS.primary} />
              <Text style={styles.exercisesTitle}>Ejercicios de Esta Semana</Text>
            </View>
            {chapter.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <Ionicons name="checkbox-outline" size={18} color={COLORS.secondary} />
                <Text style={styles.exerciseText}>{exercise}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isCompleted ? (
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>Marcar como Completado</Text>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          ) : nextChapter ? (
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={() => router.replace(`/chapter/${nextChapter.id}`)}
            >
              <Text style={styles.nextButtonText}>Siguiente Capítulo</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          ) : (
            <View style={styles.finalMessage}>
              <Ionicons name="trophy" size={24} color={COLORS.warning} />
              <Text style={styles.finalText}>¡Has completado el programa!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Questionnaire Modal (Chapter 2) */}
      <Modal visible={showQuestionnaireModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cuestionario de Angustia Inicial</Text>
            <Text style={styles.modalSubtitle}>Responde basándote en las últimas 2 semanas</Text>
          </View>
          
          <ScrollView style={styles.questionnaireScroll}>
            {DISTRESS_QUESTIONS.map((question, index) => (
              <View key={question.key} style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.label}
                </Text>
                <View style={styles.answerRow}>
                  {[0, 1, 2, 3, 4].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.answerButton,
                        questionnaireAnswers[question.key] === value && styles.answerButtonActive,
                      ]}
                      onPress={() => setQuestionnaireAnswers({
                        ...questionnaireAnswers,
                        [question.key]: value,
                      })}
                    >
                      <Text style={[
                        styles.answerText,
                        questionnaireAnswers[question.key] === value && styles.answerTextActive,
                      ]}>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Nada</Text>
                  <Text style={styles.scaleLabel}>Muy severo</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleQuestionnaireSubmit}
            >
              <Text style={styles.modalButtonText}>Guardar y Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorLink: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 12,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  lockedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backButtonLocked: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  completedText: {
    fontSize: 11,
    color: COLORS.surface,
    marginLeft: 4,
    fontWeight: '500',
  },
  titleCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  duration: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
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
  sectionContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  exercisesCard: {
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  exerciseText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  finalMessage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  finalText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  questionnaireScroll: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  answerButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  answerTextActive: {
    color: COLORS.surface,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  modalActions: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
