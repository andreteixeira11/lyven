import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Bell,
  Globe,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Mail,
  Lock,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { COLORS } from '@/constants/colors';

export default function Settings() {
  const { user, logout } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Terminar Sessão',
      'Tem certeza que deseja terminar a sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar Sessão',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent && rightComponent}
        {showArrow && <ChevronRight size={20} color={COLORS.black} />}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Definições',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <User size={40} color={COLORS.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Utilizador'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileType}>
              {user?.userType === 'promoter' ? 'Promotor' : 'Cliente'}
            </Text>
          </View>
        </View>

        {/* Account Settings */}
        <SectionHeader title="Conta" />
        <View style={styles.section}>
          <SettingItem
            icon={User}
            title="Editar Perfil"
            subtitle="Nome, email e foto de perfil"
            onPress={() => router.push('/edit-profile')}
          />
          <SettingItem
            icon={Lock}
            title="Segurança"
            subtitle="Alterar palavra-passe"
            onPress={() => router.push('/security')}
          />
          {user?.userType === 'promoter' && (
            <SettingItem
              icon={CreditCard}
              title="Métodos de Pagamento"
              subtitle="Gerir formas de recebimento"
              onPress={() => Alert.alert('Pagamentos', 'Funcionalidade em desenvolvimento')}
            />
          )}
        </View>

        {/* Notifications */}
        <SectionHeader title="Notificações" />
        <View style={styles.section}>
          <SettingItem
            icon={Bell}
            title="Notificações Push"
            subtitle="Receber alertas no dispositivo"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
          <SettingItem
            icon={Mail}
            title="Email"
            subtitle="Preferências de email"
            onPress={() => router.push('/email-preferences')}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="Aplicação" />
        <View style={styles.section}>
          <SettingItem
            icon={Globe}
            title="Idioma"
            subtitle="Português"
            onPress={() => Alert.alert('Idioma', 'Funcionalidade em desenvolvimento')}
          />
          <SettingItem
            icon={Smartphone}
            title="Localização"
            subtitle={locationEnabled ? 'Ativada' : 'Desativada'}
            showArrow={false}
            rightComponent={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
        </View>

        {/* Privacy & Security */}
        <SectionHeader title="Privacidade e Segurança" />
        <View style={styles.section}>
          <SettingItem
            icon={Shield}
            title="Privacidade e Dados"
            subtitle="Gerir dados e privacidade"
            onPress={() => Alert.alert('Privacidade', 'Funcionalidade em desenvolvimento')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Termos de Serviço"
            subtitle="Políticas e termos"
            onPress={() => Alert.alert('Termos', 'Funcionalidade em desenvolvimento')}
          />
        </View>



        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.primary} />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 2,
  },
  profileType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold' as const,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.headerText,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.header,
  },
  section: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.black,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold' as const,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.black,
  },
});