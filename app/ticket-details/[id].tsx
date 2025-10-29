import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking
} from 'react-native';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  FileText,
  Download,
  BookmarkCheck,
  XCircle,
  Flag,
  ChevronRight
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme-context';
import QRCode from '@/components/QRCode';
import { mockEvents } from '@/mocks/events';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

interface Ticket {
  id: string;
  buyerName: string;
  ticketNumber: number;
  totalTickets: number;
  ticketType: string;
  qrCode: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    buyerName: 'Fábio Caires',
    ticketNumber: 1,
    totalTickets: 2,
    ticketType: 'General Admission',
    qrCode: 'TICKET-001-ABC123'
  },
  {
    id: '2',
    buyerName: 'Fábio Caires',
    ticketNumber: 2,
    totalTickets: 2,
    ticketType: 'General Admission',
    qrCode: 'TICKET-002-ABC124'
  }
];

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const event = mockEvents.find(e => e.id === id);
  
  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Evento não encontrado</Text>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleShare = () => {
    Alert.alert('Partilhar', 'Funcionalidade em desenvolvimento');
  };

  const handleAddToWallet = () => {
    Alert.alert('Apple Wallet', 'Adicionar à Apple Wallet');
  };

  const handleAddToCalendar = () => {
    Alert.alert('Calendário', 'Evento adicionado ao calendário');
  };

  const handleViewMap = () => {
    if (event.coordinates) {
      const url = `https://maps.google.com/?q=${event.coordinates.latitude},${event.coordinates.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleEventDetails = () => {
    router.push(`/event/${event.id}`);
  };

  const handleOrderDetails = () => {
    Alert.alert('Detalhes do pedido', 'Ver detalhes da compra');
  };

  const handleDownloadTicket = () => {
    Alert.alert('Baixar ingresso', 'Download iniciado');
  };

  const handleTicketInfo = () => {
    Alert.alert('Informações', 'Informações sobre os ingressos');
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: () => console.log('Cancelado') }
      ]
    );
  };

  const handleReportEvent = () => {
    Alert.alert('Reportar evento', 'Descreva o problema');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.dateHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(event.date)}
            </Text>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(event.date)}
            </Text>
          </View>

          <View style={[styles.eventInfo, { backgroundColor: colors.card }]}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.ticketCarousel}
          >
            {mockTickets.map((ticket) => (
              <View key={ticket.id} style={[styles.ticketCard, { width }]}>
                <View style={styles.qrContainer}>
                  <QRCode 
                    value={ticket.qrCode} 
                    size={QR_SIZE} 
                    backgroundColor={isDark ? '#1E1E1E' : '#FFFFFF'}
                    foregroundColor={isDark ? '#FFFFFF' : '#000000'}
                  />
                </View>
                <Text style={[styles.ticketOwner, { color: colors.text }]}>
                  {ticket.buyerName} · Bilhete {ticket.ticketNumber} do {ticket.totalTickets}
                </Text>
                <Text style={[styles.ticketType, { color: colors.textSecondary }]}>
                  {ticket.ticketType}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {mockTickets.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex ? colors.text : colors.border,
                    opacity: index === currentIndex ? 1 : 0.3
                  }
                ]}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.walletButton, { backgroundColor: colors.text }]}
            onPress={handleAddToWallet}
          >
            <View style={styles.walletIcon}>
              <View style={[styles.walletCard, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.walletCard, { backgroundColor: '#4ECDC4' }]} />
              <View style={[styles.walletCard, { backgroundColor: '#95E1D3' }]} />
            </View>
            <Text style={[styles.walletButtonText, { color: colors.background }]}>
              Adicionar à Apple Wallet
            </Text>
          </TouchableOpacity>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data e horário</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
                <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                  {formatTime(event.date)}
                </Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
                <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                  {event.endDate ? formatTime(event.endDate) : '23:00'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleAddToCalendar}
            >
              <Text style={[styles.linkButtonText, { color: colors.text }]}>
                Adicionar ao calendário
              </Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Localização
            </Text>
            <Text style={[styles.locationText, { color: colors.text }]}>
              {event.venue.name}
            </Text>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleViewMap}
            >
              <Text style={[styles.linkButtonText, { color: colors.text }]}>
                Visualizar mapa
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
            <MenuItem
              icon={<Sparkles size={24} color={colors.text} />}
              label="Detalhes do evento"
              onPress={handleEventDetails}
              colors={colors}
            />
            <MenuItem
              icon={<FileText size={24} color={colors.text} />}
              label="Detalhes do pedido"
              onPress={handleOrderDetails}
              colors={colors}
            />
            <MenuItem
              icon={<Download size={24} color={colors.text} />}
              label="Baixe o ingresso"
              onPress={handleDownloadTicket}
              colors={colors}
            />
            <MenuItem
              icon={<BookmarkCheck size={24} color={colors.text} />}
              label="Informações dos ingressos"
              onPress={handleTicketInfo}
              colors={colors}
            />
            <MenuItem
              icon={<XCircle size={24} color={colors.text} />}
              label="Cancelar pedido"
              onPress={handleCancelOrder}
              colors={colors}
            />
            <MenuItem
              icon={<Flag size={24} color={colors.text} />}
              label="Reportar evento"
              onPress={handleReportEvent}
              colors={colors}
              isLast
            />
          </View>

          <View style={[styles.organizerSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.organizerTitle, { color: colors.text }]}>
              Organizado por
            </Text>
            <View style={[styles.organizerCard, { backgroundColor: colors.background }]}>
              <Image 
                source={{ uri: event.promoter.image }} 
                style={styles.organizerImage}
              />
              <View style={styles.organizerInfo}>
                <Text style={[styles.organizerName, { color: colors.text }]}>
                  {event.promoter.name}
                </Text>
                <View style={styles.organizerStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Seguidores
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {(event.promoter.followersCount / 1000).toFixed(1)}k
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Eventos
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>321</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Hospedagem
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>8 anos</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: any;
  isLast?: boolean;
}

function MenuItem({ icon, label, onPress, colors, isLast }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>{icon}</View>
      <Text style={[styles.menuItemText, { color: colors.text }]}>{label}</Text>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    gap: 16,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  ticketCarousel: {
    marginBottom: 16,
  },
  ticketCard: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  qrContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketOwner: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 14,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 24,
    gap: 12,
  },
  walletIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletCard: {
    width: 20,
    height: 14,
    borderRadius: 2,
    marginLeft: -6,
  },
  walletButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  locationText: {
    fontSize: 15,
    marginBottom: 12,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  organizerSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  organizerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  organizerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  organizerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  organizerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
