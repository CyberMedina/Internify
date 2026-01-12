import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface MonthYearPickerProps {
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  label?: string;
  error?: string;
  startYear?: number;
  endYear?: number;
}

const MONTHS = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

export default function MonthYearPicker({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  label,
  error,
  startYear = 1970,
  endYear = new Date().getFullYear(),
}: MonthYearPickerProps) {
  const { colors, typography, spacing } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'month' | 'year'>('month');

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => (endYear - i).toString());

  const handleOpenMonth = () => {
    setPickerType('month');
    setModalVisible(true);
  };

  const handleOpenYear = () => {
    setPickerType('year');
    setModalVisible(true);
  };

  const handleSelect = (value: string) => {
    if (pickerType === 'month') {
      onMonthChange(value);
    } else {
      onYearChange(value);
    }
    setModalVisible(false);
  };

  const getMonthLabel = (value: string) => {
    const month = MONTHS.find((m) => m.value === value);
    return month ? month.label : 'Mes';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>{label}</Text>}
      
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.input,
            { 
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.surface,
              flex: 1,
              marginRight: 8
            }
          ]}
          onPress={handleOpenMonth}
        >
          <Text style={{ color: selectedMonth ? colors.text : colors.textSecondary }}>
            {selectedMonth ? getMonthLabel(selectedMonth) : 'Mes'}
          </Text>
          <FontAwesome5 name="chevron-down" size={12} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.input,
            { 
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.surface,
              flex: 1,
              marginLeft: 8
            }
          ]}
          onPress={handleOpenYear}
        >
          <Text style={{ color: selectedYear ? colors.text : colors.textSecondary }}>
            {selectedYear || 'Año'}
          </Text>
          <FontAwesome5 name="chevron-down" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {error && <Text style={[styles.errorText, { color: colors.error, fontSize: typography.sizes.xs }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg, fontFamily: typography.bold }]}>
              Seleccionar {pickerType === 'month' ? 'Mes' : 'Año'}
            </Text>
            
            <FlatList
              data={pickerType === 'month' ? MONTHS : years}
              keyExtractor={(item) => typeof item === 'string' ? item : item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelect(typeof item === 'string' ? item : item.value)}
                >
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: colors.text,
                      fontFamily: (pickerType === 'month' ? item.value === selectedMonth : item === selectedYear) ? typography.bold : typography.regular
                    }
                  ]}>
                    {typeof item === 'string' ? item : item.label}
                  </Text>
                  {(pickerType === 'month' ? item.value === selectedMonth : item === selectedYear) && (
                    <FontAwesome5 name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
});
