import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthGuard from "@/components/AuthGuard";
import PromoterDashboard from "@/components/PromoterDashboard";
import { useUser } from "@/hooks/user-context";
import { COLORS } from "@/constants/colors";
import { router } from 'expo-router';
import { mockEvents } from '@/mocks/events';
import { Event } from '@/types/event';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck,
  AlertCircle,
  MapPin
} from 'lucide-react-native';

interface AdminStats {
  totalUsers: number;
  totalPromoters: number;
  totalEvents: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeEvents: number;
  newUsersToday: number;
  newEventsToday: number;
}

function NormalUserExploreContent() {
  const insets = useSafeAreaInsets();

  const featuredEvents = mockEvents.filter((e: Event) => e.isFeatured);
  const upcomingEvents = mockEvents.filter(
    (e: Event) => new Date(e.date) > new Date()
  ).sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const EventCard = ({ event }: { event: Event }) => (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => router.push(`/event/${event.id}` as any)}
      >
        <Image source={{ uri: event.image }} style={styles.eventCardImage} />
        <View style={styles.eventCardContent}>
          <Text style={styles.eventCardTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.eventCardInfo}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventCardDate}>
              {new Date(event.date).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          <View style={styles.eventCardInfo}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventCardLocation} numberOfLines={1}>
              {event.venue.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.exploreContent}>
          <View style={styles.exploreHeader}>
            <Text style={styles.exploreTitle}>Explorar Eventos</Text>
            <Text style={styles.exploreSubtitle}>Descobre os melhores eventos perto de ti</Text>
          </View>

          {featuredEvents.length > 0 && (
            <View style={styles.exploreSection}>
              <Text style={styles.exploreSectionTitle}>Em Destaque</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredEvents.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.exploreSection}>
            <Text style={styles.exploreSectionTitle}>Próximos Eventos</Text>
            {upcomingEvents.slice(0, 10).map((event: Event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventListItem}
                onPress={() => router.push(`/event/${event.id}` as any)}
              >
                <Image source={{ uri: event.image }} style={styles.eventListImage} />
                <View style={styles.eventListContent}>
                  <Text style={styles.eventListTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.eventListInfo}>
                    <Calendar size={12} color={COLORS.textSecondary} />
                    <Text style={styles.eventListText}>
                      {new Date(event.date).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </Text>
                  </View>
                  <View style={styles.eventListInfo}>
                    <MapPin size={12} color={COLORS.textSecondary} />
                    <Text style={styles.eventListText} numberOfLines={1}>
                      {event.venue.name}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function IndexContent() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [stats] = useState<AdminStats>({
    totalUsers: 1247,
    totalPromoters: 89,
    totalEvents: 342,
    totalRevenue: 45670,
    pendingApprovals: 12,
    activeEvents: 156,
    newUsersToday: 23,
    newEventsToday: 8,
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = COLORS.primary,
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (user?.email === 'geral@lyven.pt') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Bem-vindo, Admin</Text>
              <Text style={styles.subtitleText}>Painel de Controlo Lyven</Text>
            </View>

            {stats.pendingApprovals > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => router.push('/(tabs)/tickets')}
              >
                <AlertCircle size={24} color={COLORS.warning} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Aprovações Pendentes</Text>
                  <Text style={styles.alertText}>
                    {stats.pendingApprovals} publicidades aguardam aprovação
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visão Geral</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title="Total Utilizadores"
                      value={stats.totalUsers.toLocaleString()}
                      icon={Users}
                      onPress={() => router.push('/admin-users')}
                    />
                  </View>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title="Promotores"
                      value={stats.totalPromoters}
                      icon={UserCheck}
                      color={COLORS.success}
                      onPress={() => router.push('/admin-promoters')}
                    />
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title="Total Eventos"
                      value={stats.totalEvents}
                      icon={Calendar}
                      color={COLORS.warning}
                      onPress={() => router.push('/admin-events')}
                    />
                  </View>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title="Receita Total"
                      value={`€${stats.totalRevenue.toLocaleString()}`}
                      icon={DollarSign}
                      color={COLORS.success}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hoje</Text>
              <View style={styles.todayStats}>
                <View style={styles.todayStatItem}>
                  <Text style={styles.todayStatValue}>{stats.newUsersToday}</Text>
                  <Text style={styles.todayStatLabel}>Novos Utilizadores</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.todayStatValue}>{stats.newEventsToday}</Text>
                  <Text style={styles.todayStatLabel}>Novos Eventos</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.todayStatValue}>{stats.activeEvents}</Text>
                  <Text style={styles.todayStatLabel}>Eventos Ativos</Text>
                </View>
              </View>
            </View>

            <View style={{ paddingBottom: 20 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (user?.userType === 'promoter') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PromoterDashboard promoterId={user.id} />
      </View>
    );
  }

  return <NormalUserExploreContent />;
}

export default function IndexScreen() {
  return (
    <AuthGuard>
      <IndexContent />
    </AuthGuard>
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
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statsRowItem: {
    flex: 1,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: 5,
  },
  todayStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  alertContent: {
    marginLeft: 15,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.warning,
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  exploreContent: {
    padding: 20,
  },
  exploreHeader: {
    marginBottom: 24,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  exploreSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  exploreSection: {
    marginBottom: 30,
  },
  exploreSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 15,
  },
  eventCard: {
    width: 240,
    marginRight: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  eventCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventCardDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  eventCardLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  eventListItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventListImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  eventListContent: {
    flex: 1,
    padding: 12,
  },
  eventListTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 6,
  },
  eventListInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 4,
  },
  eventListText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
});