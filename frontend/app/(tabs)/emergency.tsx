import React, { useEffect, useState } from 'react';
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
import { useAppStore } from '../../src/store/useAppStore';
import { COLORS } from '../../src/utils/helpers';
import { EmergencyKitItem } from '../../src/types';

const CATEGORY_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  alarm_signal: { label: 'Señal de Alarma', icon: 'warning-outline', color: '#FF9800' },
  containment_phrase: { label: 'Frase de Contención', icon: 'chatbubble-outline', color: COLORS.primary },
  rescue_action: { label: 'Acción de Rescate', icon: 'fitness-outline', color: COLORS.secondary },
  alternative_label: { label: 'Etiqueta Alternativa', icon: 'swap-horizontal-outline', color: '#9C27B0' },
  custom: { label: 'Personal', icon: 'star-outline', color: '#00BCD4' },
};

export default function EmergencyScreen() {
  const { emergencyKit, fetchEmergencyKit, addEmergencyKitItem, deleteEmergencyKitItem } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'containment_phrase',
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchEmergencyKit();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content) {
      Alert.alert('Campos requeridos', 'Por favor completa el título y contenido.');
      return;
    }

    await addEmergencyKitItem({
      category: newItem.category as EmergencyKitItem['category'],
      title: newItem.title,
      content: newItem.content,
    });

    setShowAddModal(false);
    setNewItem({ category: 'containment_phrase', title: '', content: '' });
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Eliminar',
      '¿Estás seguro de eliminar este elemento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteEmergencyKitItem(itemId) },
      ]
    );
  };

  const groupedItems = emergencyKit.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, EmergencyKitItem[]>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Kit de Emergencia</Text>
          <Text style={styles.subtitle}>Tus herramientas personales para los picos</Text>
        </View>

        {/* Emergency Protocol */}
        <View style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <Ionicons name="medkit" size={24} color={COLORS.error} />
            <Text style={styles.protocolTitle}>Protocolo de Emergencia</Text>
          </View>
          <View style={styles.protocolSteps}>
            <View style={styles.protocolStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>DETECTA</Text>
                <Text style={styles.stepText}>Reconoce tu señal de alarma</Text>
              </View>
            </View>
            <View style={styles.protocolStep}>
              <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>CONTÉN</Text>
                <Text style={styles.stepText}>Usa tu frase de contención</Text>
              </View>
            </View>
            <View style={styles.protocolStep}>
              <View style={[styles.stepNumber, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>ACTÚA</Text>
                <Text style={styles.stepText}>Ejecuta tu acción de rescate</Text>
              </View>
            </View>
          </View>
          <View style={styles.reminderBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.reminderText}>Un pico NO es una recaída. Es una oportunidad para practicar.</Text>
          </View>
        </View>

        {/* My Kit Items */}
        <View style={styles.kitSection}>
          <View style={styles.kitHeader}>
            <Text style={styles.kitTitle}>Mi Kit Personal</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={20} color={COLORS.surface} />
              <Text style={styles.addButtonText}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {emergencyKit.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Tu kit está vacío</Text>
              <Text style={styles.emptySubtext}>Añade tus estrategias personales de afrontamiento</Text>
            </View>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={CATEGORY_CONFIG[category]?.icon || 'star-outline'}
                    size={18}
                    color={CATEGORY_CONFIG[category]?.color || COLORS.textSecondary}
                  />
                  <Text style={styles.categoryTitle}>
                    {CATEGORY_CONFIG[category]?.label || category}
                  </Text>
                </View>
                {items.map((item) => (
                  <View key={item.id} style={styles.kitItem}>
                    <View style={styles.kitItemContent}>
                      <Text style={styles.kitItemTitle}>{item.title}</Text>
                      <Text style={styles.kitItemText}>{item.content}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Quick Suggestions */}
        <View style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>Sugerencias para tu Kit</Text>
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.warning} />
            <Text style={styles.suggestionText}>
              <Text style={styles.boldText}>Frase de contención: </Text>
              "Esto es un pico, no una recaída. Es temporal."
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.warning} />
            <Text style={styles.suggestionText}>
              <Text style={styles.boldText}>Acción de rescate: </Text>
              "4 ciclos de respiración 4-6"
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.warning} />
            <Text style={styles.suggestionText}>
              <Text style={styles.boldText}>Señal de alarma: </Text>
              "Tensión en el cuello y respiración acelerada"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir al Kit</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.formLabel}>Categoría</Text>
              <View style={styles.categoryGrid}>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      newItem.category === key && { backgroundColor: config.color, borderColor: config.color },
                    ]}
                    onPress={() => setNewItem({ ...newItem, category: key })}
                  >
                    <Ionicons
                      name={config.icon}
                      size={16}
                      color={newItem.category === key ? COLORS.surface : config.color}
                    />
                    <Text style={[
                      styles.categoryChipText,
                      newItem.category === key && { color: COLORS.surface },
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Título</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Mi frase de calma"
                placeholderTextColor={COLORS.textLight}
                value={newItem.title}
                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
              />

              <Text style={styles.formLabel}>Contenido</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Escribe tu estrategia..."
                placeholderTextColor={COLORS.textLight}
                value={newItem.content}
                onChangeText={(text) => setNewItem({ ...newItem, content: text })}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
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
  protocolCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  protocolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  protocolSteps: {
    gap: 12,
  },
  protocolStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  reminderText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  kitSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  kitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
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
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  kitItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 8,
  },
  kitItemContent: {
    flex: 1,
  },
  kitItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  kitItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 8,
  },
  suggestionsCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginTop: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalContent: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
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
