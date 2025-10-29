import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Check, 
  X, 
  Eye, 
  Calendar,
  MapPin,
  DollarSign,
  User,
  Clock,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import AuthGuard from '@/components/AuthGuard';
import CreateEvent from '@/app/create-event';
import { router } from 'expo-router';

interface PendingAd {
  id: string;
  promoterId: string;
  promoterName: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  adType: 'banner' | 'featured' | 'spotlight';
  price: number;
  duration: number;
  imageUrl: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

function TicketsContent() {
  const { user } = useUser();

  if (user?.email === 'admin@lyven.com') {
    return <AdminApprovalsContent />;
  }

  if (user?.userType === 'promoter') {
    return <CreateEvent />;
  }

  return <NormalUserTicketsContent />;
}

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  venue: string;
  city: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  qrCode: string;
  isUsed: boolean;
}

function NormalUserTicketsContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const [userTickets] = useState<UserTicket[]>([
    {
      id: 't1',
      eventId: '1',
      eventTitle: 'Arctic Monkeys',
      eventImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      eventDate: '2025-02-15T21:00:00',
      venue: 'Coliseu dos Recreios',
      city: 'Lisboa',
      ticketType: 'Plateia',
      quantity: 2,
      totalPrice: 90,
      purchaseDate: '2025-01-10T14:30:00',
      qrCode: 'QR123456',
      isUsed: false,
    },
    {
      id: 't2',
      eventId: '6',
      eventTitle: 'Sam Smith - Gloria Tour',
      eventImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      eventDate: '2025-06-22T21:00:00',
      venue: 'Altice Arena',
      city: 'Lisboa',
      ticketType: 'Pista',
      quantity: 1,
      totalPrice: 65,
      purchaseDate: '2025-01-12T10:15:00',
      qrCode: 'QR789012',
      isUsed: false,
    },
  ]);

  const now = new Date();
  const upcomingTickets = userTickets.filter(t => new Date(t.eventDate) >= now && !t.isUsed);
  const pastTickets = userTickets.filter(t => new Date(t.eventDate) < now || t.isUsed);

  const TicketCard = ({ ticket }: { ticket: UserTicket }) => (
    <TouchableOpacity
      style={[styles.ticketCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/event/${ticket.eventId}` as any)}
    >
      <Image source={{ uri: ticket.eventImage }} style={styles.ticketImage} />
      <View style={styles.ticketContent}>
        <View style={styles.ticketHeader}>
          <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={2}>
            {ticket.eventTitle}
          </Text>
          {ticket.isUsed && (
            <View style={[styles.usedBadge, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.usedBadgeText}>Usado</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ticketDetails}>
          <View style={styles.ticketDetailRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
              {new Date(ticket.eventDate).toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          
          <View style={styles.ticketDetailRow}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
              {new Date(ticket.eventDate).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          
          <View style={styles.ticketDetailRow}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.ticketDetailText, { color: colors.textSecondary }]}>
              {ticket.venue}, {ticket.city}
            </Text>
          </View>
        </View>

        <View style={[styles.ticketFooter, { borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.ticketType, { color: colors.text }]}>{ticket.ticketType}</Text>
            <Text style={[styles.ticketQuantity, { color: colors.textSecondary }]}>{ticket.quantity}x bilhete(s)</Text>
          </View>
          <Text style={[styles.ticketPrice, { color: colors.primary }]}>€{ticket.totalPrice}</Text>
        </View>

        {!ticket.isUsed && new Date(ticket.eventDate) >= now && (
          <TouchableOpacity
            style={[styles.viewQRButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('QR Code', `Código: ${ticket.qrCode}`)}
          >
            <Eye size={16} color={colors.white} />
            <Text style={[styles.viewQRButtonText, { color: colors.white }]}>Ver QR Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({ tab, title, count }: { tab: 'upcoming' | 'past'; title: string; count: number }) => (
    <TouchableOpacity
      style={[
        styles.ticketTabButton,
        { backgroundColor: selectedTab === tab ? colors.primary : colors.border }
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.ticketTabText,
        { color: selectedTab === tab ? colors.white : colors.textSecondary }
      ]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  const currentTickets = selectedTab === 'upcoming' ? upcomingTickets : pastTickets;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.ticketHeader}>
        <Text style={[styles.ticketHeaderTitle, { color: colors.text }]}>Os Meus Bilhetes</Text>
        <Text style={[styles.ticketHeaderSubtitle, { color: colors.textSecondary }]}>
          {userTickets.length} {userTickets.length === 1 ? 'bilhete' : 'bilhetes'}
        </Text>
      </View>

      <View style={styles.ticketTabContainer}>
        <TabButton tab="upcoming" title="Próximos" count={upcomingTickets.length} />
        <TabButton tab="past" title="Passados" count={pastTickets.length} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.ticketsContent}>
          {currentTickets.length > 0 ? (
            currentTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTicketsTitle, { color: colors.text }]}>
                {selectedTab === 'upcoming' ? 'Nenhum bilhete próximo' : 'Nenhum bilhete passado'}
              </Text>
              <Text style={[styles.emptyTicketsSubtitle, { color: colors.textSecondary }]}>
                {selectedTab === 'upcoming'
                  ? 'Explora eventos e compra os teus bilhetes'
                  : 'Os teus bilhetes usados aparecerão aqui'}
              </Text>
              {selectedTab === 'upcoming' && (
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Text style={[styles.exploreButtonText, { color: colors.white }]}>Explorar Eventos</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function AdminApprovalsContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([
    {
      id: '1',
      promoterId: 'p1',
      promoterName: 'João Silva',
      eventId: 'e1',
      eventTitle: 'Festival de Verão 2024',
      eventDate: '2024-07-15',
      eventLocation: 'Lisboa',
      adType: 'featured',
      price: 150,
      duration: 7,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      description: 'Grande festival de música com artistas nacionais e internacionais',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      promoterId: 'p2',
      promoterName: 'Maria Santos',
      eventId: 'e2',
      eventTitle: 'Concerto de Jazz',
      eventDate: '2024-06-20',
      eventLocation: 'Porto',
      adType: 'banner',
      price: 75,
      duration: 3,
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
      description: 'Noite especial de jazz com músicos locais',
      submittedAt: '2024-01-14T15:45:00Z',
      status: 'pending'
    },
    {
      id: '3',
      promoterId: 'p3',
      promoterName: 'Carlos Oliveira',
      eventId: 'e3',
      eventTitle: 'Teatro Clássico',
      eventDate: '2024-08-10',
      eventLocation: 'Coimbra',
      adType: 'spotlight',
      price: 200,
      duration: 10,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      description: 'Peça clássica interpretada por companhia local',
      submittedAt: '2024-01-13T09:15:00Z',
      status: 'pending'
    }
  ]);

  const getAdTypeLabel = (type: string) => {
    switch (type) {
      case 'banner': return 'Banner';
      case 'featured': return 'Destaque';
      case 'spotlight': return 'Spotlight';
      default: return type;
    }
  };

  const getAdTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return COLORS.info;
      case 'featured': return COLORS.warning;
      case 'spotlight': return COLORS.primary;
      default: return '#999';
    }
  };

  const handleApprove = (adId: string) => {
    Alert.alert(
      'Aprovar Publicidade',
      'Tem certeza que deseja aprovar esta publicidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: () => {
            setPendingAds(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'approved' as const } : ad
              )
            );
            Alert.alert('Sucesso', 'Publicidade aprovada com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (adId: string) => {
    Alert.alert(
      'Rejeitar Publicidade',
      'Tem certeza que deseja rejeitar esta publicidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPendingAds(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'rejected' as const } : ad
              )
            );
            Alert.alert('Rejeitada', 'Publicidade rejeitada.');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const AdCard = ({ ad }: { ad: PendingAd }) => (
    <View style={[styles.adCard, { backgroundColor: colors.card }]}>
      <View style={styles.adHeader}>
        <View style={styles.adHeaderLeft}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{ad.eventTitle}</Text>
          <View style={[styles.adTypeBadge, { backgroundColor: getAdTypeColor(ad.adType) + '20' }]}>
            <Text style={[styles.adTypeText, { color: getAdTypeColor(ad.adType) }]}>
              {getAdTypeLabel(ad.adType)}
            </Text>
          </View>
        </View>
        <Text style={[styles.priceText, { color: colors.success }]}>€{ad.price}</Text>
      </View>

      <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />

      <View style={styles.adDetails}>
        <View style={styles.detailRow}>
          <User size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.promoterName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDate(ad.eventDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.eventLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.duration} dias de duração</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.text }]}>{ad.description}</Text>

      <View style={[styles.submissionInfo, { borderTopColor: colors.border }]}>
        <Text style={[styles.submissionText, { color: colors.textSecondary }]}>
          Submetido em {formatDate(ad.submittedAt)}
        </Text>
      </View>

      {ad.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleReject(ad.id)}
          >
            <X size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Rejeitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => handleApprove(ad.id)}
          >
            <Check size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {ad.status !== 'pending' && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: ad.status === 'approved' ? colors.success + '20' : colors.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: ad.status === 'approved' ? colors.success : colors.error }
          ]}>
            {ad.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
          </Text>
        </View>
      )}
    </View>
  );

  const pendingCount = pendingAds.filter(ad => ad.status === 'pending').length;
  const approvedCount = pendingAds.filter(ad => ad.status === 'approved').length;
  const rejectedCount = pendingAds.filter(ad => ad.status === 'rejected').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{pendingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>{approvedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aprovadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>{rejectedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejeitadas</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Publicidades Pendentes</Text>
            {pendingAds.filter(ad => ad.status === 'pending').map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
            {pendingCount === 0 && (
              <View style={styles.emptyState}>
                <Eye size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nenhuma publicidade pendente</Text>
              </View>
            )}
          </View>

          {(approvedCount > 0 || rejectedCount > 0) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Decisões Recentes</Text>
              {pendingAds.filter(ad => ad.status !== 'pending').map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function TicketsScreen() {
  return (
    <AuthGuard>
      <TicketsContent />
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
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
  adCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  adHeaderLeft: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 5,
  },
  adTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adTypeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  adImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  adDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  submissionInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 15,
  },
  submissionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  ticketHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  ticketHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  ticketHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  ticketTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  ticketTabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  ticketTabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  ticketTabText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  ticketTabTextActive: {
    color: COLORS.white,
    fontWeight: '600' as const,
  },
  ticketsContent: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  ticketContent: {
    padding: 15,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  usedBadge: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  ticketDetails: {
    marginBottom: 12,
    gap: 6,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 12,
  },
  ticketType: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  ticketQuantity: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ticketPrice: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  viewQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewQRButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptyTicketsTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTicketsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
