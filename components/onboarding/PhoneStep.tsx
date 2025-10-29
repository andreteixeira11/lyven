import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Smartphone } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface PhoneStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function PhoneStep({ data, onUpdate }: PhoneStepProps) {
  const [phone, setPhone] = useState(data.phone || '');

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    setPhone(cleaned);
    onUpdate({ phone: cleaned });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Smartphone size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.description}>
          Adicione o seu número de telemóvel para recuperação de conta e notificações importantes
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.prefixContainer}>
          <Text style={styles.prefixText}>+351</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="9XX XXX XXX"
          placeholderTextColor={COLORS.textSecondary}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={13}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔒 Segurança</Text>
        <Text style={styles.infoText}>
          O seu número de telemóvel será usado apenas para:
        </Text>
        <Text style={styles.infoItem}>• Recuperação de conta</Text>
        <Text style={styles.infoItem}>• Notificações de bilhetes</Text>
        <Text style={styles.infoItem}>• Alertas de eventos</Text>
        <Text style={styles.infoSubtext}>
          Pode alterar isto mais tarde nas definições
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 30,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 2,
    borderRightColor: COLORS.border,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  infoBox: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
});
