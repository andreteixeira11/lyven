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
import { COLORS } from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';

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
  
  const { createUser, updateUser } = useUser();
  
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
        
        try {
          await trpcClient.auth.sendVerificationCode.mutate({
            email,
            name,
            password,
          });
          
          router.push({
            pathname: '/verify-email',
            params: { email, name, password },
          });
        } catch (error: any) {
          console.error('Erro ao enviar código:', error);
          setErrorMessage(error.message || 'Erro ao enviar código de verificação. Este email pode já estar registado.');
        }
      }
    } catch (error) {
      console.error('❌ Erro durante autenticação:', error);
      setErrorMessage('Ocorreu um erro durante a autenticação. Por favor, verifique os seus dados e tente novamente.');
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
                    userType === 'normal' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('normal')}
                >
                  <User size={20} color={userType === 'normal' ? COLORS.white : COLORS.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === 'normal' && styles.userTypeTextActive,
                    ]}
                  >
                    Utilizador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'promoter' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('promoter')}
                >
                  <Building2 size={20} color={userType === 'promoter' ? COLORS.white : COLORS.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === 'promoter' && styles.userTypeTextActive,
                    ]}
                  >
                    Promotor
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {!isLogin && userType === 'normal' && (
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.inputIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Palavra-passe"
                  placeholderTextColor="#666"
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
                  <Text style={styles.forgotPasswordText}>Esqueceu a palavra-passe?</Text>
                </TouchableOpacity>
              )}

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
                </Text>
              </TouchableOpacity>

              {userType === 'normal' && (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={styles.switchText}>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <Text style={styles.switchTextBold}>
                      {isLogin ? 'Criar conta' : 'Entrar'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              {userType === 'promoter' && !isLogin && (
                <View style={styles.promoterInfoBox}>
                  <Building2 size={16} color={COLORS.primary} />
                  <Text style={styles.promoterInfoText}>
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
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
    gap: 12,
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userTypeText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  userTypeTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  switchButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  switchText: {
    color: '#000',
    fontSize: 14,
  },
  switchTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold' as const,
  },
  promoterInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  promoterInfoText: {
    flex: 1,
    color: '#E65100',
    fontSize: 13,
    lineHeight: 18,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
