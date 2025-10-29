import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  ArrowLeft,
  Tag,
  Printer,
  Mail,
  CreditCard
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';

interface TicketDetail {
  id: string;
  name: string;
  email: string;
  orderId: string;
  saleType: string;
  purchaseDate: Date;
  paymentMethod: string;
  deliveryMethod: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

const mockTicketDetails: { [key: string]: TicketDetail } = {
  '1': {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    orderId: '13591626053',
    saleType: 'Venda online',
    purchaseDate: new Date('2025-01-15T14:30:00'),
    paymentMethod: 'Visa 6463',
    deliveryMethod: 'eTicket: Executados 1 de 1',
    ticketType: 'VIP',
    quantity: 2,
    unitPrice: 60,
    totalPrice: 120,
  },
  '2': {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    orderId: '13591626054',
    saleType: 'Venda online',
    purchaseDate: new Date('2025-01-20T10:15:00'),
    paymentMethod: 'Visa 6464',
    deliveryMethod: 'eTicket: Executados 1 de 1',
    ticketType: 'Geral',
    quantity: 1,
    unitPrice: 35,
    totalPrice: 35,
  },
  '3': {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    orderId: '13591626055',
    saleType: 'Venda online',
    purchaseDate: new Date('2025-01-25T16:45:00'),
    paymentMethod: 'Mastercard 1234',
    deliveryMethod: 'eTicket: Executados 4 de 4',
    ticketType: 'Geral',
    quantity: 4,
    unitPrice: 35,
    totalPrice: 140,
  },
  '4': {
    id: '4',
    name: 'Ana Ferreira',
    email: 'ana.ferreira@email.com',
    orderId: '13591626056',
    saleType: 'Venda online',
    purchaseDate: new Date('2025-02-01T12:20:00'),
    paymentMethod: 'Visa 6465',
    deliveryMethod: 'eTicket: Executados 1 de 1',
    ticketType: 'VIP',
    quantity: 1,
    unitPrice: 60,
    totalPrice: 60,
  }
};

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const ticketDetail = mockTicketDetails[id || '1'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const formatted = new Intl.DateTimeFormat('pt-PT', options).format(date);
    return formatted.replace(',', '');
  };
  
  const handleRefund = () => {
    Alert.alert(
      'Reembolso',
      `Confirmar reembolso de ${formatCurrency(ticketDetail.totalPrice)} para ${ticketDetail.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => console.log('Refund initiated') }
      ]
    );
  };
  
  const handlePrint = () => {
    Alert.alert(
      'Imprimir',
      'Funcionalidade de impressão em desenvolvimento',
      [{ text: 'OK' }]
    );
  };
  
  const handleEmail = () => {
    Alert.alert(
      'Enviar E-mail',
      `Enviar recibo para ${ticketDetail.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Email sent') }
      ]
    );
  };
  
  if (!ticketDetail) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Detalhes não encontrados</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Detalhes do pedido',
          headerStyle: { backgroundColor: '#1F1147' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.customerName}>{ticketDetail.name}</Text>
            <Text style={styles.customerEmail}>{ticketDetail.email}</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Pedido n.º</Text>
              <Text style={styles.infoValue}>{ticketDetail.orderId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Venda</Text>
              <Text style={styles.infoValue}>{ticketDetail.saleType}</Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formatDate(ticketDetail.purchaseDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Pagamento</Text>
              <Text style={styles.infoValue}>{ticketDetail.paymentMethod}</Text>
            </View>
          </View>
          
          <View style={styles.deliverySection}>
            <Text style={styles.deliveryLabel}>Método de entrega</Text>
            <Text style={styles.deliveryValue}>{ticketDetail.deliveryMethod}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRefund}>
              <Tag size={24} color="#1F1147" />
              <Text style={styles.actionButtonText}>Reembolso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <Printer size={24} color="#666" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextInactive]}>Imprimir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Mail size={24} color="#1F1147" />
              <Text style={styles.actionButtonText}>E-mail</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bilhetes</Text>
            
            <View style={styles.ticketItem}>
              <Text style={styles.ticketDescription}>
                {ticketDetail.quantity} x {ticketDetail.ticketType}
              </Text>
              <Text style={styles.ticketPrice}>{formatCurrency(ticketDetail.totalPrice)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(ticketDetail.totalPrice)}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{ticketDetail.paymentMethod}</Text>
              <Text style={styles.paymentValue}>-{formatCurrency(ticketDetail.totalPrice)}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <TouchableOpacity style={styles.addNoteButton}>
              <Text style={styles.addNoteText}>Adicionar nota sobre o pedido</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F1147',
    marginBottom: 8,
  },
  customerEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  deliverySection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  deliveryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 24,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1F1147',
    fontWeight: '500' as const,
  },
  actionButtonTextInactive: {
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ticketDescription: {
    fontSize: 16,
    color: '#000',
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#000',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  addNoteButton: {
    paddingVertical: 12,
  },
  addNoteText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
});
