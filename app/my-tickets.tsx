import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { ShoppingCart, Ticket, Calendar, MapPin, ChevronRight, Info, ChevronLeft } from "lucide-react-native";
import { useCart } from "@/hooks/cart-context";
import { mockEvents } from "@/mocks/events";
import { router } from "expo-router";
import { useState } from "react";
import { COLORS } from "@/constants/colors";
import QRCode from '@/components/QRCode';

export default function MyTicketsScreen() {
  const { cartItems, purchasedTickets, getTotalPrice, removeFromCart } = useCart();
  const [activeTab, setActiveTab] = useState<'cart' | 'purchased'>('purchased');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEventById = (id: string) => mockEvents.find(e => e.id === id);
  const getTicketType = (eventId: string, ticketTypeId: string) => {
    const event = getEventById(eventId);
    return event?.ticketTypes.find(t => t.id === ticketTypeId);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Os Meus Bilhetes</Text>
        <TouchableOpacity 
          style={styles.faqButton}
          onPress={() => router.push('/faq')}
        >
          <Info size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
          onPress={() => setActiveTab('cart')}
        >
          <ShoppingCart size={18} color={activeTab === 'cart' ? COLORS.primary : COLORS.primary} />
          <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
            Carrinho ({cartItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'purchased' && styles.activeTab]}
          onPress={() => setActiveTab('purchased')}
        >
          <Ticket size={18} color={activeTab === 'purchased' ? COLORS.primary : COLORS.primary} />
          <Text style={[styles.tabText, activeTab === 'purchased' && styles.activeTabText]}>
            Meus Ingressos ({purchasedTickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'cart' ? (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyState}>
                <ShoppingCart size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>Carrinho vazio</Text>
                <Text style={styles.emptyText}>Adicione ingressos para continuar</Text>
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cartItems.map((item, index) => {
                  const event = getEventById(item.eventId);
                  const ticketType = getTicketType(item.eventId, item.ticketTypeId);
                  if (!event || !ticketType) return null;

                  return (
                    <View key={`${item.eventId}-${item.ticketTypeId}`} style={styles.cartItem}>
                      <Image source={{ uri: event.image }} style={styles.itemImage} />
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{event.title}</Text>
                        <Text style={styles.itemType}>{ticketType.name}</Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemQuantity}>{item.quantity}x €{item.price}</Text>
                          <Text style={styles.itemTotal}>€{item.price * item.quantity}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => removeFromCart(item.eventId, item.ticketTypeId)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          {cartItems.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>€{getTotalPrice()}</Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                <ChevronRight size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {purchasedTickets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ticket size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Sem ingressos</Text>
              <Text style={styles.emptyText}>Seus ingressos comprados aparecerão aqui</Text>
            </View>
          ) : (
            <>
              {purchasedTickets.map(ticket => {
                const event = getEventById(ticket.eventId);
                const ticketType = getTicketType(ticket.eventId, ticket.ticketTypeId);
                if (!event || !ticketType) return null;

                return (
                  <TouchableOpacity 
                    key={ticket.id} 
                    style={styles.ticketCard}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: event.image }} style={styles.ticketImage} />
                    <View style={styles.ticketContent}>
                      <Text style={styles.ticketTitle}>{event.title}</Text>
                      <Text style={styles.ticketType}>{ticketType.name} • {ticket.quantity} ingresso(s)</Text>
                      <View style={styles.ticketInfo}>
                        <View style={styles.infoRow}>
                          <Calendar size={14} color={COLORS.primary} />
                          <Text style={styles.ticketDate}>{formatDate(event.date)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <MapPin size={14} color={COLORS.primary} />
                          <Text style={styles.ticketVenue}>{event.venue.name}</Text>
                        </View>
                      </View>
                      <View style={styles.qrContainer}>
                        <QRCode
                          value={ticket.qrCode}
                          size={120}
                          backgroundColor={COLORS.white}
                        />
                        <Text style={styles.qrCode}>{ticket.id}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  faqButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}10`,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}20`,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600' as const,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
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
    fontWeight: 'bold' as const,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  itemType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.gray,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  removeButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  footer: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketImage: {
    width: '100%',
    height: 150,
  },
  ticketContent: {
    padding: 16,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  ticketType: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  ticketInfo: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  ticketVenue: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  qrContainer: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrCode: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: 'monospace' as const,
  },
});
