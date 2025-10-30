import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimeStepProps {
  date: Date;
  time?: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}

export default function DateTimeStep({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimeStepProps) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const formatDate = (d: Date): string => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  };

  const formatTime = (t?: Date): string => {
    if (!t) return 'Selecionar hora (opcional)';
    return new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(t);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        onDateChange(selectedDate);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        onDateChange(selectedDate);
      }
    }
    
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime && selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
        onTimeChange(selectedTime);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedTime && selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
        onTimeChange(selectedTime);
      }
    }
    
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data e Hora</Text>
      <Text style={styles.subtitle}>
        Quando será o seu evento?
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <Calendar size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Data do Evento *</Text>
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <Clock size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Hora do Evento</Text>
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={[styles.dateButtonText, !time && styles.placeholder]}>
            {formatTime(time)}
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' && (
        <>
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.iosPickerButton}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={[styles.iosPickerButton, styles.iosPickerButtonDone]}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.iosPicker}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={showTimePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowTimePicker(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.iosPickerButton}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={[styles.iosPickerButton, styles.iosPickerButtonDone]}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={time || new Date()}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.iosPicker}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iosPickerButton: {
    fontSize: 16,
    color: '#0099a8',
  },
  iosPickerButtonDone: {
    fontWeight: '600' as const,
  },
  iosPicker: {
    height: 200,
  },
});
