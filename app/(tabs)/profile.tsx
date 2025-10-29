import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  LogOut,
  Heart,
  History,
  Shield,
  HelpCircle,
  Calendar,
  MapPin,
  Users,
  Eye,
  Euro,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const { theme, isDark, changeTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<number | null>(null);

  const isAdmin = user?.email === 'geral@lyven.pt';
  const isPromoter = user?.userType === 'promoter';

  const handleLogoTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    if (newTapCount >= 5) {
      setTapCount(0);
      router.push('/admin-dashboard');
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000) as any;
    }
  };

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

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  if (isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User size={32} color={COLORS.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Administrador</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.promoterBadge}>
                <Shield size={12} color="#FFD700" />
                <Text style={styles.promoterText}>Admin</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-settings')}>
              <Settings size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Configurações do Sistema</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Terminar Sessão</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isPromoter) {
    const nextEvent = {
      id: 'demo-1',
      title: 'Arctic Monkeys',
      date: '2025-02-15T21:00:00',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      venue: 'Coliseu dos Recreios',
      ticketsSold: 1250,
      totalTickets: 1500,
      revenue: 48750,
      views: 8450,
    };

    const progress = (nextEvent.ticketsSold / nextEvent.totalTickets) * 100;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User size={32} color={COLORS.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Promotor'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.promoterBadge}>
                <Shield size={12} color="#FFD700" />
                <Text style={styles.promoterText}>Promotor</Text>
              </View>
            </View>
          </View>

          <View style={styles.nextEventSection}>
            <TouchableOpacity 
              style={styles.nextEventCard}
              onPress={() => router.push(`/promoter-event/${nextEvent.id}` as any)}
            >
              <Image 
                source={{ uri: nextEvent.image }} 
                style={styles.nextEventImage}
              />
              <View style={styles.nextEventOverlay}>
                <View style={styles.nextEventHeader}>
                  <Text style={styles.nextEventName}>{nextEvent.title}</Text>
                  <View style={styles.nextEventDate}>
                    <Calendar size={14} color="#fff" />
                    <Text style={styles.nextEventDateText}>
                      {new Date(nextEvent.date).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.nextEventVenue}>
                  <MapPin size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.nextEventVenueText}>{nextEvent.venue}</Text>
                </View>

                <View style={styles.nextEventStats}>
                  <View style={styles.nextEventStat}>
                    <Users size={14} color="#4CAF50" />
                    <Text style={styles.nextEventStatText}>
                      {nextEvent.ticketsSold}/{nextEvent.totalTickets}
                    </Text>
                  </View>
                  <View style={styles.nextEventStat}>
                    <Euro size={14} color="#FFD700" />
                    <Text style={styles.nextEventStatText}>
                      €{nextEvent.revenue.toLocaleString('pt-PT')}
                    </Text>
                  </View>
                  <View style={styles.nextEventStat}>
                    <Eye size={14} color="#2196F3" />
                    <Text style={styles.nextEventStatText}>
                      {nextEvent.views.toLocaleString('pt-PT')}
                    </Text>
                  </View>
                </View>

                <View style={styles.nextEventProgress}>
                  <View style={styles.nextEventProgressBar}>
                    <View 
                      style={[
                        styles.nextEventProgressFill,
                        { width: `${Math.min(progress, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.nextEventProgressText}>
                    {progress.toFixed(0)}% vendidos
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.nextEventHint}>
              👆 Clique para ver Compradores, Scanner e Estatísticas
            </Text>
          </View>
          
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('/settings')}>
              <Settings size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Definições</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('/help')}>
              <HelpCircle size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Ajuda</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Terminar Sessão</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <TouchableOpacity style={styles.avatar} onPress={handleLogoTap} activeOpacity={0.7}>
        <User size={32} color={COLORS.primary} />
      </TouchableOpacity>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.name || 'Utilizador'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
    </View>
  );

  const MenuItem = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={20} color={COLORS.text} />
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderUserMenuItems = () => (
    <>
      <MenuItem
        icon={Heart}
        title="Favoritos"
        onPress={() => handleMenuItemPress('/(tabs)/favorites')}
      />
      
      <MenuItem
        icon={History}
        title="Histórico"
        onPress={() => Alert.alert('Histórico', 'Funcionalidade em desenvolvimento')}
      />

      <View style={styles.themeMenuItem}>
        <View style={styles.themeLeft}>
          {isDark ? (
            <Moon size={20} color={COLORS.text} />
          ) : (
            <Sun size={20} color={COLORS.text} />
          )}
          <Text style={styles.menuText}>Modo Noturno</Text>
        </View>
        <Switch
          value={theme === 'dark' || (theme === 'system' && isDark)}
          onValueChange={(value) => changeTheme(value ? 'dark' : 'light')}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.separator} />
    </>
  );

  const renderCommonMenuItems = () => (
    <>
      <MenuItem
        icon={Settings}
        title="Definições"
        onPress={() => handleMenuItemPress('/settings')}
      />
      
      <MenuItem
        icon={HelpCircle}
        title="Ajuda"
        onPress={() => handleMenuItemPress('/help')}
      />
      
      <View style={styles.separator} />
      
      <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
        {renderUserInfo()}
        
        <View style={styles.menuItems}>
          {renderUserMenuItems()}
          {renderCommonMenuItems()}
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.header,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  userEmail: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.9,
  },
  promoterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoterText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginLeft: 4,
  },
  approvedIcon: {
    marginLeft: 4,
  },
  menuItems: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuText: {
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500' as const,
  },
  themeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: 'bold' as const,
  },
  nextEventSection: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  nextEventTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  nextEventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextEventImage: {
    width: '100%',
    height: 200,
  },
  nextEventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  nextEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextEventName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    flex: 1,
  },
  nextEventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nextEventDateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  nextEventVenue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  nextEventVenueText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  nextEventStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  nextEventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextEventStatText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  nextEventProgress: {
    marginTop: 8,
  },
  nextEventProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 4,
  },
  nextEventProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  nextEventProgressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
  nextEventHint: {
    marginTop: 12,
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
});
