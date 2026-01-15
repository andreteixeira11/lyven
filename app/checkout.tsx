import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform } from "react-native";
import { useCart } from "@/hooks/cart-context";
import { mockEvents } from "@/mocks/events";
import { router, Stack } from "expo-router";
import { CreditCard, CheckCircle, X, Phone, Building2 } from "lucide-react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import { useUser } from "@/hooks/user-context";
import { useTheme } from "@/hooks/theme-context";
import { RADIUS, SHADOWS, SPACING } from "@/constants/colors";

type PaymentMethod = 'card' | 'mbway' | 'multibanco';

export default function CheckoutScreen() {
  const { cartItems, getTotalPrice, completePurchase } = useCart();
  const { user } = useUser();
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Finalizar Compra',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }} 
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Resumo do Pedido</Text>
          {cartItems.map((item) => {
            const event = getEventById(item.eventId);
            const ticketType = getTicketType(item.eventId, item.ticketTypeId);
            if (!event || !ticketType) return null;

            return (
              <View key={`${item.eventId}-${item.ticketTypeId}`} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
                <View style={styles.orderItemInfo}>
                  <Text style={[styles.eventName, { color: colors.text }]}>{event.title}</Text>
                  <Text style={[styles.ticketInfo, { color: colors.textSecondary }]}>
                    {ticketType.name} • {item.quantity}x €{item.price}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.primary }]}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Método de Pagamento</Text>
          
          <TouchableOpacity 
            style={[
              styles.paymentMethod, 
              { backgroundColor: colors.background, borderColor: colors.border },
              selectedPayment === 'card' && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
            ]}
            onPress={() => setSelectedPayment('card')}
          >
            <CreditCard size={24} color={selectedPayment === 'card' ? colors.primary : colors.textSecondary} />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle, 
                { color: colors.textSecondary },
                selectedPayment === 'card' && { color: colors.primary }
              ]}>
                Cartão de Crédito/Débito
              </Text>
              <Text style={[styles.paymentSubtitle, { color: colors.textLight }]}>Visa, Mastercard, American Express</Text>
            </View>
            {selectedPayment === 'card' && <CheckCircle size={20} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.paymentMethod, 
              { backgroundColor: colors.background, borderColor: colors.border },
              selectedPayment === 'mbway' && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
            ]}
            onPress={() => setSelectedPayment('mbway')}
          >
            <Phone size={24} color={selectedPayment === 'mbway' ? colors.primary : colors.textSecondary} />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle, 
                { color: colors.textSecondary },
                selectedPayment === 'mbway' && { color: colors.primary }
              ]}>
                MB WAY
              </Text>
              <Text style={[styles.paymentSubtitle, { color: colors.textLight }]}>Pagamento instantâneo</Text>
            </View>
            {selectedPayment === 'mbway' && <CheckCircle size={20} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.paymentMethod, 
              { backgroundColor: colors.background, borderColor: colors.border },
              selectedPayment === 'multibanco' && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
            ]}
            onPress={() => setSelectedPayment('multibanco')}
          >
            <Building2 size={24} color={selectedPayment === 'multibanco' ? colors.primary : colors.textSecondary} />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle, 
                { color: colors.textSecondary },
                selectedPayment === 'multibanco' && { color: colors.primary }
              ]}>
                Multibanco
              </Text>
              <Text style={[styles.paymentSubtitle, { color: colors.textLight }]}>Referência para pagamento</Text>
            </View>
            {selectedPayment === 'multibanco' && <CheckCircle size={20} color={colors.primary} />}
          </TouchableOpacity>
        </View>

        {selectedPayment === 'card' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Dados do Cartão</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Número do Cartão"
              placeholderTextColor={colors.textSecondary}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Nome no Cartão"
              placeholderTextColor={colors.textSecondary}
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="MM/AA"
                placeholderTextColor={colors.textSecondary}
                value={cardExpiry}
                onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                keyboardType="numeric"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inputHalf, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="CVV"
                placeholderTextColor={colors.textSecondary}
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
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Dados MB WAY</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Número de Telemóvel (9 dígitos)"
              placeholderTextColor={colors.textSecondary}
              value={mbwayPhone}
              onChangeText={setMbwayPhone}
              keyboardType="phone-pad"
              maxLength={9}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Receberá uma notificação no seu telemóvel para confirmar o pagamento.
            </Text>
          </View>
        )}

        {selectedPayment === 'multibanco' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Após clicar em confirmar, receberá uma referência Multibanco para efetuar o pagamento.
              Os bilhetes serão disponibilizados após a confirmação do pagamento.
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Detalhes do Pagamento</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>€{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Taxa de Serviço (10%)</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>€{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow, { borderTopColor: colors.primary }]}>
            <Text style={[styles.totalLabel, { color: colors.primary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          Ao finalizar a compra, concorda com os Termos de Uso e Política de Privacidade.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.purchaseButton, { backgroundColor: colors.primary }, isProcessing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          <Text style={[styles.purchaseButtonText, { color: colors.white }]}>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowPaymentDetails(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.modalIcon, { backgroundColor: colors.primaryLight }]}>
              <Building2 size={48} color={colors.primary} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.primary }]}>Referência Multibanco</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Utilize os dados abaixo para efetuar o pagamento
            </Text>

            <View style={[styles.referenceContainer, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <View style={[styles.referenceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Entidade</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>{multibancoEntity}</Text>
              </View>
              <View style={[styles.referenceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Referência</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>{multibancoReference}</Text>
              </View>
              <View style={[styles.referenceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Montante</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={[styles.modalInfo, { color: colors.textSecondary }]}>
              Esta referência é válida por 24 horas. Os seus bilhetes serão disponibilizados
              assim que o pagamento for confirmado.
            </Text>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleMultibancoConfirm}
            >
              <Text style={[styles.modalButtonText, { color: colors.white }]}>Entendido</Text>
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
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  section: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: SPACING.lg,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  orderItemInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  ticketInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    marginBottom: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  paymentSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  input: {
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputHalf: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  totalRow: {
    borderTopWidth: 2,
    marginTop: SPACING.sm,
    paddingTop: SPACING.lg,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center' as const,
    marginVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    lineHeight: 18,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  purchaseButton: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
  },
  modalClose: {
    position: 'absolute' as const,
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center' as const,
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: SPACING.xxl,
  },
  referenceContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  referenceLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  referenceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalInfo: {
    fontSize: 13,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: SPACING.xxl,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});