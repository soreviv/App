import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { PROGRAM_WEEKS } from '../../src/data/programContent';
import { COLORS, isChapterUnlocked, getProgressPercentage } from '../../src/utils/helpers';

export default function ProgramScreen() {
  const router = useRouter();
  const { progress } = useAppStore();
  const completedChapters = progress?.chapters_completed || [];

  const getWeekProgress = (weekId: number) => {
    const week = PROGRAM_WEEKS.find(w => w.id === weekId);
    if (!week) return 0;
    const completed = week.chapters.filter(c => completedChapters.includes(c.id)).length;
    return Math.round((completed / week.chapters.length) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Programa de 8 Semanas</Text>
            <Text style={styles.subtitle}>
              {getProgressPercentage(completedChapters)}% completado
            </Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={styles.overallProgress}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage(completedChapters)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedChapters.length} de 12 capítulos completados
          </Text>
        </View>

        {/* Weeks List */}
        {PROGRAM_WEEKS.map((week, weekIndex) => {
          const weekProgress = getWeekProgress(week.id);
          const isCurrentWeek = progress?.current_week === week.id;

          return (
            <View key={week.id} style={styles.weekContainer}>
              <View style={styles.weekHeader}>
                <View style={styles.weekTitleContainer}>
                  <View style={[
                    styles.weekBadge,
                    weekProgress === 100 && styles.weekBadgeComplete,
                    isCurrentWeek && styles.weekBadgeCurrent,
                  ]}>
                    {weekProgress === 100 ? (
                      <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                    ) : (
                      <Text style={[
                        styles.weekBadgeText,
                        isCurrentWeek && styles.weekBadgeTextCurrent,
                      ]}>{week.id}</Text>
                    )}
                  </View>
                  <View style={styles.weekInfo}>
                    <Text style={styles.weekTitle}>{week.title}</Text>
                    <Text style={styles.weekPart}>{week.part} - {week.partTitle}</Text>
                  </View>
                </View>
                {weekProgress > 0 && weekProgress < 100 && (
                  <Text style={styles.weekProgress}>{weekProgress}%</Text>
                )}
              </View>

              <Text style={styles.weekDescription}>{week.description}</Text>

              {/* Chapters */}
              <View style={styles.chaptersContainer}>
                {week.chapters.map((chapter, chapterIndex) => {
                  const isCompleted = completedChapters.includes(chapter.id);
                  const isUnlocked = isChapterUnlocked(chapter.id, completedChapters);

                  return (
                    <TouchableOpacity
                      key={chapter.id}
                      style={[
                        styles.chapterCard,
                        !isUnlocked && styles.chapterCardLocked,
                        isCompleted && styles.chapterCardCompleted,
                      ]}
                      onPress={() => isUnlocked && router.push(`/chapter/${chapter.id}`)}
                      disabled={!isUnlocked}
                    >
                      <View style={styles.chapterLeft}>
                        <View style={[
                          styles.chapterIcon,
                          isCompleted && styles.chapterIconCompleted,
                          !isUnlocked && styles.chapterIconLocked,
                        ]}>
                          {isCompleted ? (
                            <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                          ) : !isUnlocked ? (
                            <Ionicons name="lock-closed" size={14} color={COLORS.textLight} />
                          ) : (
                            <Text style={styles.chapterNumber}>{chapter.id}</Text>
                          )}
                        </View>
                        <View style={styles.chapterInfo}>
                          <Text style={[
                            styles.chapterTitle,
                            !isUnlocked && styles.chapterTitleLocked,
                          ]}>
                            {chapter.title}
                          </Text>
                          <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
                          <View style={styles.chapterMeta}>
                            <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
                            <Text style={styles.chapterDuration}>{chapter.duration}</Text>
                          </View>
                        </View>
                      </View>
                      {isUnlocked && (
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={isCompleted ? COLORS.success : COLORS.textLight} 
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overallProgress: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
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
  weekContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekBadgeComplete: {
    backgroundColor: COLORS.success,
  },
  weekBadgeCurrent: {
    backgroundColor: COLORS.primary,
  },
  weekBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  weekBadgeTextCurrent: {
    color: COLORS.surface,
  },
  weekInfo: {
    marginLeft: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  weekPart: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  weekProgress: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  weekDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginLeft: 44,
    lineHeight: 18,
  },
  chaptersContainer: {
    marginTop: 12,
    gap: 8,
  },
  chapterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterCardLocked: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chapterCardCompleted: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterIconCompleted: {
    backgroundColor: COLORS.success,
  },
  chapterIconLocked: {
    backgroundColor: COLORS.border,
  },
  chapterNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chapterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  chapterTitleLocked: {
    color: COLORS.textLight,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chapterDuration: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  bottomPadding: {
    height: 32,
  },
});
