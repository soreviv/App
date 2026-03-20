import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import { COLORS, getDistressLevel, calculateProgressReduction, formatDateShort } from '../../src/utils/helpers';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { progress, dailyLogs, questionnaireResponses, fetchDailyLogs, fetchQuestionnaireResponses } = useAppStore();
  const [activeTab, setActiveTab] = useState<'distress' | 'questionnaire'>('distress');

  useEffect(() => {
    fetchDailyLogs();
    fetchQuestionnaireResponses();
  }, []);

  // Prepare chart data from daily logs
  const chartData = dailyLogs
    .slice(0, 14)
    .reverse()
    .map((log, index) => ({
      value: log.distress_level,
      label: formatDateShort(log.date),
      dataPointText: log.distress_level.toString(),
    }));

  const completedChapters = progress?.chapters_completed?.length || 0;
  const initialScore = questionnaireResponses[0]?.total_score;
  const latestScore = questionnaireResponses[questionnaireResponses.length - 1]?.total_score;
  const progressReduction = initialScore && latestScore 
    ? calculateProgressReduction(initialScore, latestScore)
    : 0;

  const averageDistress = dailyLogs.length > 0
    ? Math.round(dailyLogs.reduce((sum, log) => sum + log.distress_level, 0) / dailyLogs.length * 10) / 10
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu Progreso</Text>
          <Text style={styles.subtitle}>Seguimiento de tu camino hacia la habituación</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{completedChapters}/12</Text>
            <Text style={styles.statLabel}>Capítulos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{dailyLogs.length}</Text>
            <Text style={styles.statLabel}>Días Registrados</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-down-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{progressReduction}%</Text>
            <Text style={styles.statLabel}>Reducción</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'distress' && styles.activeTab]}
            onPress={() => setActiveTab('distress')}
          >
            <Text style={[styles.tabText, activeTab === 'distress' && styles.activeTabText]}>
              Nivel Diario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'questionnaire' && styles.activeTab]}
            onPress={() => setActiveTab('questionnaire')}
          >
            <Text style={[styles.tabText, activeTab === 'questionnaire' && styles.activeTabText]}>
              Cuestionario
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'distress' ? (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Nivel de Molestia (Últimos 14 días)</Text>
            {chartData.length > 0 ? (
              <View style={styles.chartWrapper}>
                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={200}
                  spacing={40}
                  color={COLORS.primary}
                  thickness={2}
                  startFillColor={COLORS.primaryLight}
                  endFillColor={COLORS.background}
                  startOpacity={0.3}
                  endOpacity={0.05}
                  initialSpacing={20}
                  noOfSections={5}
                  maxValue={10}
                  yAxisColor={COLORS.border}
                  xAxisColor={COLORS.border}
                  yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 9 }}
                  hideDataPoints={false}
                  dataPointsColor={COLORS.primary}
                  dataPointsRadius={4}
                  curved
                  areaChart
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Aún no hay datos suficientes</Text>
                <Text style={styles.emptySubtext}>Registra tu nivel diario para ver tu progreso</Text>
              </View>
            )}

            {dailyLogs.length > 0 && (
              <View style={styles.avgContainer}>
                <Text style={styles.avgLabel}>Promedio:</Text>
                <View style={[
                  styles.avgBadge,
                  { backgroundColor: getDistressLevel(averageDistress * 2.8).color + '20' }
                ]}>
                  <Text style={[styles.avgValue, { color: getDistressLevel(averageDistress * 2.8).color }]}>
                    {averageDistress}/10
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Cuestionario de Angustia</Text>
            {questionnaireResponses.length > 0 ? (
              <View style={styles.questionnaireList}>
                {questionnaireResponses.map((response, index) => {
                  const level = getDistressLevel(response.total_score);
                  return (
                    <View key={response.id} style={styles.questionnaireItem}>
                      <View style={styles.questionnaireWeek}>
                        <Text style={styles.questionnaireWeekText}>Semana {response.week_number}</Text>
                      </View>
                      <View style={styles.questionnaireScore}>
                        <Text style={[styles.scoreValue, { color: level.color }]}>
                          {response.total_score}/28
                        </Text>
                        <Text style={[styles.scoreLabel, { color: level.color }]}>
                          {level.label}
                        </Text>
                      </View>
                      {index > 0 && (
                        <View style={styles.changeIndicator}>
                          {response.total_score < questionnaireResponses[index - 1].total_score ? (
                            <Ionicons name="trending-down" size={20} color={COLORS.success} />
                          ) : response.total_score > questionnaireResponses[index - 1].total_score ? (
                            <Ionicons name="trending-up" size={20} color={COLORS.error} />
                          ) : (
                            <Ionicons name="remove" size={20} color={COLORS.textLight} />
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="clipboard-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Sin cuestionarios completados</Text>
                <Text style={styles.emptySubtext}>Completa el cuestionario en el Capítulo 2</Text>
              </View>
            )}
          </View>
        )}

        {/* Interpretation Guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Interpretación del Cuestionario</Text>
          <View style={styles.guideItems}>
            <View style={styles.guideItem}>
              <View style={[styles.guideDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.guideText}>0-7: Leve</Text>
            </View>
            <View style={styles.guideItem}>
              <View style={[styles.guideDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.guideText}>8-14: Moderado</Text>
            </View>
            <View style={styles.guideItem}>
              <View style={[styles.guideDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.guideText}>15-21: Severo</Text>
            </View>
            <View style={styles.guideItem}>
              <View style={[styles.guideDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.guideText}>22-28: Muy Severo</Text>
            </View>
          </View>
          <Text style={styles.guideMeta}>
            Meta realista: Reducción de 30-50% después de 8 semanas
          </Text>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.surface,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chartWrapper: {
    marginLeft: -10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
  },
  avgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avgLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  avgBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  avgValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionnaireList: {
    gap: 12,
  },
  questionnaireItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  questionnaireWeek: {
    flex: 1,
  },
  questionnaireWeekText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  questionnaireScore: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 11,
  },
  changeIndicator: {
    width: 24,
  },
  guideCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  guideItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  guideText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  guideMeta: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
