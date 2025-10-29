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
  Bell,
  Calendar,
  Users,
  Heart,
  TrendingUp,
  MessageSquare,
  Settings,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { COLORS } from '@/constants/colors';

interface Notification {
  id: string;
  type: 'event' | 'follower' | 'ticket' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
}

export default function Notifications() {
  const { user } = useUser();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [followerUpdates, setFollowerUpdates] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'Novo evento próximo',
      message: 'Arctic Monkeys - Concerto em Lisboa amanhã às 21:00',
      timestamp: new Date('2025-01-18T10:30:00'),
      read: false,
      actionable: true,
    },
    {
      id: '2',
      type: 'follower',
      title: 'Novo seguidor',
      message: 'Maria Santos começou a seguir você',
      timestamp: new Date('2025-01-17T15:45:00'),
      read: false,
    },
    {
      id: '3',
      type: 'ticket',
      title: 'Bilhete validado',
      message: 'Seu bilhete para Festival NOS Alive foi validado com sucesso',
      timestamp: new Date('2025-01-16T20:15:00'),
      read: true,
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Promoção especial',
      message: 'Desconto de 20% em todos os eventos de música eletrônica',
      timestamp: new Date('2025-01-15T12:00:00'),
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'Atualização da app',
      message: 'Nova versão disponível com melhorias de performance',
      timestamp: new Date('2025-01-14T09:00:00'),
      read: true,
    },
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Calendar size={20} color={COLORS.primary} />;
      case 'follower':
        return <Users size={20} color={COLORS.info} />;
      case 'ticket':
        return <Check size={20} color={COLORS.success} />;
      case 'promotion':
        return <TrendingUp size={20} color={COLORS.warning} />;
      case 'system':
        return <Settings size={20} color={COLORS.gray} />;
      default:
        return <Bell size={20} color={COLORS.gray} />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else if (days < 7) {
      return `${days}d atrás`;
    } else {
      return date.toLocaleDateString('pt-PT');
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Limpar Notificações',
      'Tem certeza que deseja remover todas as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const sendMessageToFollowers = () => {
    Alert.alert(
      'Enviar Mensagem',
      'Enviar notificação para todos os seus seguidores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            Alert.alert('Sucesso', 'Mensagem enviada para todos os seguidores!');
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: `Notificações ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Check size={24} color={COLORS.headerText} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={clearAll}>
                <Trash2 size={24} color={COLORS.headerText} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Notificações Push</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={pushEnabled ? COLORS.white : COLORS.gray}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MessageSquare size={20} color={COLORS.info} />
              <Text style={styles.settingText}>Notificações por Email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={emailEnabled ? COLORS.white : COLORS.gray}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Calendar size={20} color={COLORS.success} />
              <Text style={styles.settingText}>Lembretes de Eventos</Text>
            </View>
            <Switch
              value={eventReminders}
              onValueChange={setEventReminders}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={eventReminders ? COLORS.white : COLORS.gray}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Users size={20} color={COLORS.warning} />
              <Text style={styles.settingText}>Atualizações de Seguidores</Text>
            </View>
            <Switch
              value={followerUpdates}
              onValueChange={setFollowerUpdates}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={followerUpdates ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>

        {/* Promoter Actions */}
        {user?.userType === 'promoter' && (
          <View style={styles.promoterSection}>
            <Text style={styles.sectionTitle}>Ações do Promotor</Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={sendMessageToFollowers}
            >
              <MessageSquare size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Enviar Mensagem aos Seguidores</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>
            Notificações Recentes {unreadCount > 0 && `(${unreadCount} não lidas)`}
          </Text>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>Nenhuma notificação</Text>
              <Text style={styles.emptySubtext}>
                Você receberá notificações sobre eventos, seguidores e atualizações aqui
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationLeft}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadText
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <X size={16} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.headerText,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.header,
  },
  settingsSection: {
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
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  promoterSection: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  notificationsSection: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unreadNotification: {
    backgroundColor: COLORS.surface,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold' as const,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
});