import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const password = params.password as string;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<TextInput[]>([]);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setErrorMessage('Por favor, insira o código completo');
      shakeInputs();
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await trpcClient.auth.verifyCode.mutate({
        email,
        code: codeToVerify,
      });

      Alert.alert('Sucesso', 'Email verificado com sucesso!');
      router.replace({
        pathname: '/onboarding',
        params: { email, name, password },
      });
    } catch (error: any) {
      console.error('Erro ao verificar código:', error);
      setErrorMessage(error.message || 'Código inválido. Por favor, tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      shakeInputs();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await trpcClient.auth.sendVerificationCode.mutate({
        email,
        name,
        password,
      });

      Alert.alert('Código Reenviado', 'Um novo código foi enviado para o seu email');
      setCanResend(false);
      setResendTimer(60);
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      setErrorMessage(error.message || 'Erro ao reenviar código. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Mail size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Verifique o seu email</Text>
              <Text style={styles.description}>
                Enviámos um código de 6 dígitos para{'\n'}
                <Text style={styles.email}>{email}</Text>
              </Text>
            </View>

            <Animated.View
              style={[
                styles.codeContainer,
                { transform: [{ translateX: shakeAnimation }] },
              ]}
            >
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                    errorMessage && styles.codeInputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </Animated.View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                  <Text style={styles.resendText}>Reenviar código</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Reenviar código em {resendTimer}s
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, (isLoading || code.join('').length !== 6) && styles.buttonDisabled]}
              onPress={() => handleVerify()}
              disabled={isLoading || code.join('').length !== 6}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold' as const,
    textAlign: 'center',
    color: COLORS.text,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  codeInputError: {
    borderColor: '#EF4444',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  timerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});
