import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform } from "react-native";
import { useCart } from "@/hooks/cart-context";
import { mockEvents } from "@/mocks/events";
import { router, Stack } from "expo-router";
import { CreditCard, CheckCircle, X, Phone, Building2 } from "lucide-react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import { useUser } from "@/hooks/user-context";

type PaymentMethod = 'card' | 'mbway' | 'multibanco';

export default function CheckoutScreen() {
  const { cartItems, getTotalPrice, completePurchase } = useCart();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('card');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Erro', 'Número de cartão inválido');
      return false;
    }
    if (cardName.length < 3) {
      Alert.alert('Erro', 'Por favor, insira o nome completo no cartão');
      return false;
    }
    if (cardExpiry.length !== 5) {
      Alert.alert('Erro', 'Data de validade inválida');
      return false;
    }
    if (cardCvv.length < 3) {
      Alert.alert('Erro', 'CVV inválido');
      return false;
    }
    return true;
  };
  
  const [mbwayPhone, setMbwayPhone] = useState('');
  
  const [multibancoEntity, setMultibancoEntity] = useState('');
  const [multibancoReference, setMultibancoReference] = useState('');

  const getEventById = (id: string) => mockEvents.find(e => e.id === id);
  const getTicketType = (eventId: string, ticketTypeId: string) => {
    const event = getEventById(eventId);
    return event?.ticketTypes.find(t => t.id === ticketTypeId);
  };

  const subtotal = getTotalPrice();
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Erro', 'É necessário iniciar sessão para comprar bilhetes.');
      return;
    }

    if (selectedPayment === 'card') {
      if (!validateCard()) {
        return;
      }
    }
    
    if (selectedPayment === 'mbway' && !mbwayPhone) {
      Alert.alert('Erro', 'Por favor, insira o seu número de telefone.');
      return;
    }

    setIsProcessing(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {
      if (selectedPayment === 'multibanco') {
        const entity = '12345';
        const reference = String(Math.floor(100000000 + Math.random() * 900000000));
        setMultibancoEntity(entity);
        setMultibancoReference(reference);
        setShowPaymentDetails(true);
        setIsProcessing(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = await completePurchase(user.id);
      setIsProcessing(false);
      
      if (success) {
        Alert.alert(
          'Compra Realizada! ✓',
          'Os seus bilhetes foram adicionados à secção "Os Meus Bilhetes" e receberá um email de confirmação em breve.',
          [
            {
              text: 'Ver Bilhetes',
              onPress: () => {
                router.dismissAll();
                router.push('/my-tickets');
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível concluir a compra. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setIsProcessing(false);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    }
  };

  const handleMultibancoConfirm = async () => {
    if (!user) {
      Alert.alert('Erro', 'É necessário iniciar sessão para comprar bilhetes.');
      return;
    }

    try {
      const success = await completePurchase(user.id);
      setShowPaymentDetails(false);
      
      if (success) {
        Alert.alert(
          'Referência Guardada',
          'A referência Multibanco foi guardada. Os seus bilhetes serão disponibilizados após confirmação do pagamento (normalmente em algumas horas).',
          [
            {
              text: 'Ver Bilhetes',
              onPress: () => {
                router.dismissAll();
                router.push('/my-tickets');
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível concluir a compra. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento Multibanco:', error);
      setShowPaymentDetails(false);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Finalizar Compra',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#0099a8',
          headerTitleStyle: {
            fontWeight: 'bold' as const,
          },
        }} 
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          {cartItems.map((item) => {
            const event = getEventById(item.eventId);
            const ticketType = getTicketType(item.eventId, item.ticketTypeId);
            if (!event || !ticketType) return null;

            return (
              <View key={`${item.eventId}-${item.ticketTypeId}`} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.eventName}>{event.title}</Text>
                  <Text style={styles.ticketInfo}>
                    {ticketType.name} • {item.quantity}x €{item.price}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pagamento</Text>
          
          <TouchableOpacity 
            style={[styles.paymentMethod, selectedPayment === 'card' && styles.paymentMethodSelected]}
            onPress={() => setSelectedPayment('card')}
          >
            <CreditCard size={24} color={selectedPayment === 'card' ? "#0099a8" : "#666"} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, selectedPayment === 'card' && styles.paymentTitleSelected]}>
                Cartão de Crédito/Débito
              </Text>
              <Text style={styles.paymentSubtitle}>Visa, Mastercard, American Express</Text>
            </View>
            {selectedPayment === 'card' && <CheckCircle size={20} color="#0099a8" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentMethod, selectedPayment === 'mbway' && styles.paymentMethodSelected]}
            onPress={() => setSelectedPayment('mbway')}
          >
            <Phone size={24} color={selectedPayment === 'mbway' ? "#0099a8" : "#666"} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, selectedPayment === 'mbway' && styles.paymentTitleSelected]}>
                MB WAY
              </Text>
              <Text style={styles.paymentSubtitle}>Pagamento instantâneo</Text>
            </View>
            {selectedPayment === 'mbway' && <CheckCircle size={20} color="#0099a8" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentMethod, selectedPayment === 'multibanco' && styles.paymentMethodSelected]}
            onPress={() => setSelectedPayment('multibanco')}
          >
            <Building2 size={24} color={selectedPayment === 'multibanco' ? "#0099a8" : "#666"} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, selectedPayment === 'multibanco' && styles.paymentTitleSelected]}>
                Multibanco
              </Text>
              <Text style={styles.paymentSubtitle}>Referência para pagamento</Text>
            </View>
            {selectedPayment === 'multibanco' && <CheckCircle size={20} color="#0099a8" />}
          </TouchableOpacity>
        </View>

        {selectedPayment === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="Número do Cartão"
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome no Cartão"
              placeholderTextColor="#999"
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="MM/AA"
                placeholderTextColor="#999"
                value={cardExpiry}
                onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                keyboardType="numeric"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="CVV"
                placeholderTextColor="#999"
                value={cardCvv}
                onChangeText={setCardCvv}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {selectedPayment === 'mbway' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados MB WAY</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de Telemóvel (9 dígitos)"
              placeholderTextColor="#999"
              value={mbwayPhone}
              onChangeText={setMbwayPhone}
              keyboardType="phone-pad"
              maxLength={9}
            />
            <Text style={styles.infoText}>
              Receberá uma notificação no seu telemóvel para confirmar o pagamento.
            </Text>
          </View>
        )}

        {selectedPayment === 'multibanco' && (
          <View style={styles.section}>
            <Text style={styles.infoText}>
              Após clicar em confirmar, receberá uma referência Multibanco para efetuar o pagamento.
              Os bilhetes serão disponibilizados após a confirmação do pagamento.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Pagamento</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>€{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxa de Serviço (10%)</Text>
            <Text style={styles.priceValue}>€{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.terms}>
          Ao finalizar a compra, concorda com os Termos de Uso e Política de Privacidade.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          <Text style={styles.purchaseButtonText}>
            {isProcessing ? 'A Processar...' : `Confirmar Pagamento €${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPaymentDetails}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowPaymentDetails(false)}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.modalIcon}>
              <Building2 size={48} color="#0099a8" />
            </View>

            <Text style={styles.modalTitle}>Referência Multibanco</Text>
            <Text style={styles.modalSubtitle}>
              Utilize os dados abaixo para efetuar o pagamento
            </Text>

            <View style={styles.referenceContainer}>
              <View style={styles.referenceRow}>
                <Text style={styles.referenceLabel}>Entidade</Text>
                <Text style={styles.referenceValue}>{multibancoEntity}</Text>
              </View>
              <View style={styles.referenceRow}>
                <Text style={styles.referenceLabel}>Referência</Text>
                <Text style={styles.referenceValue}>{multibancoReference}</Text>
              </View>
              <View style={styles.referenceRow}>
                <Text style={styles.referenceLabel}>Montante</Text>
                <Text style={styles.referenceValue}>€{total.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.modalInfo}>
              Esta referência é válida por 24 horas. Os seus bilhetes serão disponibilizados
              assim que o pagamento for confirmado.
            </Text>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleMultibancoConfirm}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#F0F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#0099a8',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderItemInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0099a8',
  },
  ticketInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#0099a8',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: '#0099a8',
    backgroundColor: '#F0F9FA',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  paymentTitleSelected: {
    color: '#0099a8',
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600' as const,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#0099a8',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#0099a8',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#0099a8',
  },
  terms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  purchaseButton: {
    backgroundColor: '#0099a8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#0099a8',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  referenceContainer: {
    backgroundColor: '#F0F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0099a8',
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  referenceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  referenceValue: {
    fontSize: 18,
    color: '#0099a8',
    fontWeight: 'bold' as const,
  },
  modalInfo: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#0099a8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});