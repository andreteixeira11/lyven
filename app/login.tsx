import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from 'react-native';

import { User, Mail, Eye, EyeOff, Building2 } from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { router } from 'expo-router';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';
import { useTheme } from '@/hooks/theme-context';

export default function LoginScreen() {
  const [userType, setUserType] = useState<'normal' | 'promoter'>('normal');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { updateUser } = useUser();
  const { colors } = useTheme();
  
  const saveUser = async (userData: any) => {
    await updateUser(userData);
  };
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale, logoRotate]);

  const handleLogoPress = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (logoClickTimeout.current) {
      clearTimeout(logoClickTimeout.current);
    }

    if (newCount === 5) {
      router.push('/admin-dashboard');
      setLogoClickCount(0);
      return;
    }

    logoClickTimeout.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  const handleAuth = async () => {
    setErrorMessage('');
    
    if (!email.trim()) {
      setErrorMessage('Por favor, insira um email');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, insira uma palavra-passe');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMessage('Por favor, insira o seu nome');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        if (email.toLowerCase() === 'admin' && password === 'admin') {
          Alert.alert('Sucesso', 'Login de administrador realizado com sucesso!');
          router.replace('/admin-dashboard');
        } else if (userType === 'promoter') {
          console.log('🔐 Login de promotor (modo mock)');
          console.log('Email:', email);
          console.log('Password:', password);
          
          if (email === 'teste' && password === 'teste') {
            const mockPromoterUser = {
              id: 'promoter-1',
              name: 'Promotor Teste',
              email: 'teste',
              userType: 'promoter' as const,
              isOnboardingComplete: true,
              bio: 'Promotor de eventos',
              location: 'Lisboa',
              favoriteEvents: [],
              eventHistory: [],
              interests: [],
              preferences: {
                notifications: true,
                emailUpdates: true,
                shareData: false,
              },
              following: {
                promoters: [],
                venues: [],
              },
              createdAt: new Date().toISOString(),
            };
            
            console.log('✅ Login bem sucedido:', mockPromoterUser);
            await saveUser(mockPromoterUser);
            Alert.alert('Sucesso', 'Login de promotor realizado com sucesso!');
            router.replace('/(tabs)');
          } else {
            console.error('❌ Credenciais inválidas');
            setErrorMessage('Email ou palavra-passe incorretos.');
          }
        } else {
          Alert.alert('Sucesso', 'Login realizado com sucesso!');
          router.replace('/(tabs)');
        }
      } else {
        if (userType === 'promoter') {
          Alert.alert(
            'Registo de Promotor',
            'O registo de promotores deve ser realizado na plataforma web. Por favor, aceda à plataforma de gestão para criar a sua conta de promotor.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        if (email.toLowerCase() === 'admin') {
          setErrorMessage('Este email não pode ser usado para registo.');
          return;
        }
        
        console.log('📧 Passando para verificação de email (modo temporário):', email);
        
        router.push({
          pathname: '/verify-email',
          params: { email, name, password },
        });
      }
    } catch (error) {
      console.error('❌ Erro durante autenticação:', error);
      setErrorMessage('Ocorreu um erro durante a autenticação. Por favor, verifique os seus dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.gradient, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleLogoPress}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.logoContainer,
                    {
                      opacity: logoOpacity,
                      transform: [
                        { scale: logoScale },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/r0eawa35sn5kfssq1aek9' }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    userType === 'normal' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setUserType('normal');
                    setIsLogin(true);
                  }}
                >
                  <User size={20} color={userType === 'normal' ? colors.white : colors.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      { color: colors.primary },
                      userType === 'normal' && { color: colors.white },
                    ]}
                  >
                    Utilizador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    userType === 'promoter' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setUserType('promoter');
                    setIsLogin(true);
                  }}
                >
                  <Building2 size={20} color={userType === 'promoter' ? colors.white : colors.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      { color: colors.primary },
                      userType === 'promoter' && { color: colors.white },
                    ]}
                  >
                    Promotor
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {!isLogin && userType === 'normal' && (
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Nome completo"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.inputIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Palavra-passe"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => router.push('/forgot-password')}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a palavra-passe?</Text>
                </TouchableOpacity>
              )}

              {errorMessage ? (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
                </Text>
              </TouchableOpacity>

              {userType === 'normal' && (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={[styles.switchText, { color: colors.text }]}>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <Text style={[styles.switchTextBold, { color: colors.primary }]}>
                      {isLogin ? 'Criar conta' : 'Entrar'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              {userType === 'promoter' && !isLogin && (
                <View style={[styles.promoterInfoBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
                  <Building2 size={16} color={colors.warning} />
                  <Text style={[styles.promoterInfoText, { color: colors.warning }]}>
                    Promotores devem registar-se na plataforma web
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 120,
  },
  form: {
    width: '100%',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    height: 56,
    borderWidth: 1.5,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  userTypeText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  button: {
    borderRadius: RADIUS.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  switchButton: {
    marginTop: SPACING.xxxl,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  switchTextBold: {
    fontWeight: '600' as const,
  },
  promoterInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xxl,
    gap: SPACING.md,
    borderWidth: 1,
  },
  promoterInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  errorContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
});
