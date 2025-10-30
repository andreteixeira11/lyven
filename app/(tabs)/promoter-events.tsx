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
import { router } from 'expo-router';
import { 
  Calendar,
  MapPin,
  Clock,
  Eye,
  Plus,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';
import { Event } from '@/types/event';
import { mockEvents } from '@/mocks/events';
import AuthGuard from '@/components/AuthGuard';

function PromoterEventsContent() {
  const insets = useSafeAreaInsets();
  const { user, promoterProfile } = useUser();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const demoPromoterEvents: Event[] = [
    {
      id: 'demo-1',
      title: 'Arctic Monkeys',
      date: new Date('2025-11-15T21:00:00'),
      category: 'music',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      venue: {
        id: 'venue-1',
        name: 'Coliseu dos Recreios',
        address: 'R. Portas de Santo Antão, 1150-268 Lisboa',
        city: 'Lisboa',
        capacity: 1500
      },
      promoter: {
        id: user?.id || 'promoter-1',
        name: user?.name || 'Promotor',
        image: 'https://via.placeholder.com/100',
        description: 'Promotor de eventos',
        verified: true,
        followersCount: 0
      },
      description: 'Show da banda britânica Arctic Monkeys em Lisboa',
      ticketTypes: [{ id: '1', name: 'Geral', price: 39, available: 250, maxPerPerson: 4 }],
      isFeatured: false,
      isSoldOut: false,
      artists: [{ id: 'artist-1', name: 'Arctic Monkeys', genre: 'Rock', image: 'https://via.placeholder.com/100' }],
      tags: ['música', 'rock'],
      coordinates: { latitude: 38.7223, longitude: -9.1393 }
    },
    {
      id: 'demo-2',
      title: 'Festival NOS Alive 2025',
      date: new Date('2025-12-10T16:00:00'),
      category: 'festival',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      venue: {
        id: 'venue-2',
        name: 'Passeio Marítimo de Algés',
        address: 'Passeio Marítimo de Algés, 1495-165 Algés',
        city: 'Algés',
        capacity: 55000
      },
      promoter: {
        id: user?.id || 'promoter-1',
        name: user?.name || 'Promotor',
        image: 'https://via.placeholder.com/100',
        description: 'Promotor de eventos',
        verified: true,
        followersCount: 0
      },
      description: 'O maior festival de música do verão',
      ticketTypes: [{ id: '1', name: 'Geral', price: 90, available: 40000, maxPerPerson: 6 }],
      isFeatured: false,
      isSoldOut: false,
      artists: [],
      tags: ['festival', 'música', 'verão'],
      coordinates: { latitude: 38.6931, longitude: -9.2369 }
    },
    {
      id: 'demo-3',
      title: 'Concerto na MEO Arena',
      date: new Date('2026-01-20T20:00:00'),
      category: 'music',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      venue: {
        id: 'venue-3',
        name: 'MEO Arena',
        address: 'Rossio dos Olivais, 1990-231 Lisboa',
        city: 'Lisboa',
        capacity: 12000
      },
      promoter: {
        id: user?.id || 'promoter-1',
        name: user?.name || 'Promotor',
        image: 'https://via.placeholder.com/100',
        description: 'Promotor de eventos',
        verified: true,
        followersCount: 0
      },
      description: 'Grande evento musical na MEO Arena',
      ticketTypes: [{ id: '1', name: 'Geral', price: 45, available: 12000, maxPerPerson: 4 }],
      isFeatured: false,
      isSoldOut: false,
      artists: [],
      tags: ['música', 'concerto'],
      coordinates: { latitude: 38.7684, longitude: -9.0937 }
    }
  ];

  const promoterEvents = mockEvents.filter((event: Event) => {
    if (promoterProfile?.companyName) {
      return event.promoter.name === promoterProfile.companyName;
    }
    return event.promoter.name === user?.name;
  });

  const allEvents = [...demoPromoterEvents, ...promoterEvents];
  const now = new Date();
  
  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);



  const EventCard = ({ event }: { event: Event }) => {
    const isDemoEvent = event.id.startsWith('demo-');
    const soldTickets = event.id === 'demo-1' ? 1250 : Math.floor(Math.random() * 100) + 50;
    const totalTickets = event.id === 'demo-1' ? 1500 : event.venue.capacity;

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventImageOverlay}>
            <Text style={styles.eventImageTitle} numberOfLines={1}>{event.title}</Text>
            <View style={styles.eventImageDateContainer}>
              <Calendar size={14} color="#fff" />
              <Text style={styles.eventImageDate}>
                {new Date(event.date).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push(`/create-event?id=${event.id}` as any)}
          >
            <Edit size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>

          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#999" />
              <Text style={styles.infoText}>
                {new Date(event.date).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={16} color="#999" />
              <Text style={styles.infoText}>
                {new Date(event.date).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color="#999" />
              <Text style={styles.infoText}>{event.venue.name}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{soldTickets}</Text>
              <Text style={styles.statLabel}>Vendidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>€{(soldTickets * 39).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Receita</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(Math.random() * 5000) + 1000}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.viewEventButton}
            onPress={() => router.push(`/promoter-event/${event.id}` as any)}
          >
            <Eye size={20} color="#fff" />
            <Text style={styles.viewEventButtonText}>Ver Evento</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const TabButton = ({ tab, title, isActive }: { tab: 'upcoming' | 'past'; title: string; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const currentEvents = selectedTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tabContainer}>
        <TabButton 
          tab="upcoming" 
          title={`Próximos (${upcomingEvents.length})`} 
          isActive={selectedTab === 'upcoming'} 
        />
        <TabButton 
          tab="past" 
          title={`Passados (${pastEvents.length})`} 
          isActive={selectedTab === 'past'} 
        />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {currentEvents.length > 0 ? (
          currentEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#666" />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'upcoming' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'upcoming' 
                ? 'Crie seu primeiro evento para começar a vender ingressos'
                : 'Seus eventos passados aparecerão aqui'
              }
            </Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => router.push('/create-event' as any)}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function PromoterEventsScreen() {
  return (
    <AuthGuard>
      <PromoterEventsContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  eventImageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventImageDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventImageDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  eventInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  viewEventButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
});
