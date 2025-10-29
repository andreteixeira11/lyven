import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Heart, Calendar, Bell, Clock, MapPin, Star, Share2 } from 'lucide-react-native';
import { useFavorites } from '@/hooks/favorites-context';
import { mockEvents } from '@/mocks/events';
import { router } from 'expo-router';
import { useMemo } from 'react';

export default function FavoritesScreen() {
  const { favorites, isFavorite, removeFromFavorites, hasReminder, shareEvent, addToCalendar } = useFavorites();
  
  const favoriteEvents = useMemo(() => {
    return mockEvents.filter(event => isFavorite(event.id));
  }, [favorites, isFavorite]);
  
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return favoriteEvents
      .filter(event => event.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [favoriteEvents]);
  
  const pastEvents = useMemo(() => {
    const now = new Date();
    return favoriteEvents
      .filter(event => event.date <= now)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [favoriteEvents]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const handleRemoveFromFavorites = async (eventId: string) => {
    await removeFromFavorites(eventId);
  };

  const handleShare = async (eventId: string, eventTitle: string) => {
    await shareEvent(eventId, eventTitle);
  };

  const handleAddToCalendar = async (eventId: string) => {
    await addToCalendar(eventId);
  };

  if (favoriteEvents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Heart size={64} color="#333" />
          <Text style={styles.emptyStateTitle}>Nenhum evento favorito</Text>
          <Text style={styles.emptyStateText}>
            Adicione eventos aos favoritos para os ver aqui e receber lembretes
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            {upcomingEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventActions}>
                      {hasReminder(event.id) && (
                        <Bell size={16} color="#FF385C" fill="#FF385C" />
                      )}
                      <TouchableOpacity onPress={() => handleRemoveFromFavorites(event.id)}>
                        <Heart size={16} color="#FF385C" fill="#FF385C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Calendar size={14} color="#999" />
                      <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <MapPin size={14} color="#999" />
                      <Text style={styles.eventDetailText}>{event.venue.name}, {event.venue.city}</Text>
                    </View>
                    {event.duration && (
                      <View style={styles.eventDetailRow}>
                        <Clock size={14} color="#999" />
                        <Text style={styles.eventDetailText}>{event.duration} min</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.eventFooter}>
                    <Text style={styles.eventPrice}>
                      A partir de €{Math.min(...event.ticketTypes.map(t => t.price))}
                    </Text>
                    <View style={styles.eventQuickActions}>
                      <TouchableOpacity 
                        style={styles.quickAction}
                        onPress={() => handleAddToCalendar(event.id)}
                      >
                        <Calendar size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.quickAction}
                        onPress={() => handleShare(event.id, event.title)}
                      >
                        <Share2 size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eventos Anteriores</Text>
            {pastEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, styles.pastEventCard]}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={[styles.eventImage, styles.pastEventImage]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, styles.pastEventTitle]}>{event.title}</Text>
                    <TouchableOpacity onPress={() => handleRemoveFromFavorites(event.id)}>
                      <Heart size={16} color="#666" fill="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Calendar size={14} color="#666" />
                      <Text style={[styles.eventDetailText, styles.pastEventText]}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <MapPin size={14} color="#666" />
                      <Text style={[styles.eventDetailText, styles.pastEventText]}>
                        {event.venue.name}, {event.venue.city}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingText}>Como foi o evento?</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star}>
                          <Star size={20} color="#333" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  eventImage: {
    width: 100,
    height: 120,
  },
  pastEventImage: {
    opacity: 0.6,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  pastEventTitle: {
    color: '#999',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventDetails: {
    gap: 4,
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 13,
    color: '#999',
  },
  pastEventText: {
    color: '#666',
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FF385C',
  },
  eventQuickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    backgroundColor: '#333',
    padding: 6,
    borderRadius: 6,
  },
  ratingSection: {
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
});