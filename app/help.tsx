import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Book,
  Shield,
  CreditCard,
  Users,
  Calendar,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'tickets' | 'events' | 'account' | 'payments';
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Como comprar bilhetes?',
      answer: 'Para comprar bilhetes, navegue até o evento desejado, selecione o tipo de bilhete e quantidade, e siga o processo de checkout. Você pode pagar com cartão de crédito ou débito.',
      category: 'tickets',
    },
    {
      id: '2',
      question: 'Como validar meu bilhete no evento?',
      answer: 'Apresente o QR code do seu bilhete digital na entrada do evento. O organizador irá escaneá-lo para validar sua entrada.',
      category: 'tickets',
    },
    {
      id: '3',
      question: 'Posso cancelar ou transferir meu bilhete?',
      answer: 'As políticas de cancelamento variam por evento. Consulte os termos específicos do evento ou entre em contato com o organizador.',
      category: 'tickets',
    },
    {
      id: '4',
      question: 'Como criar uma conta de promotor?',
      answer: 'Durante o registro, selecione "Promotor" como tipo de conta. Sua conta será analisada e aprovada pela nossa equipe antes de poder criar eventos.',
      category: 'account',
    },
    {
      id: '5',
      question: 'Como criar um evento?',
      answer: 'Acesse o painel do promotor e clique em "Criar Evento". Preencha todas as informações necessárias, incluindo data, local, preços e descrição.',
      category: 'events',
    },
    {
      id: '6',
      question: 'Quando recebo o pagamento dos bilhetes vendidos?',
      answer: 'Os pagamentos são processados após o evento, descontando as taxas da plataforma. O prazo é de 5-7 dias úteis.',
      category: 'payments',
    },
    {
      id: '7',
      question: 'Como alterar informações do meu perfil?',
      answer: 'Vá em Definições > Perfil para editar suas informações pessoais, foto e dados de contato.',
      category: 'account',
    },
    {
      id: '8',
      question: 'Como seguir promotores e artistas?',
      answer: 'Na página do evento ou perfil do promotor, clique no botão "Seguir". Você receberá notificações sobre novos eventos.',
      category: 'general',
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas', icon: Book },
    { id: 'general', name: 'Geral', icon: HelpCircle },
    { id: 'tickets', name: 'Bilhetes', icon: Calendar },
    { id: 'events', name: 'Eventos', icon: Calendar },
    { id: 'account', name: 'Conta', icon: Users },
    { id: 'payments', name: 'Pagamentos', icon: CreditCard },
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = (method: 'email' | 'phone' | 'chat') => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:suporte@diceapp.com');
        break;
      case 'phone':
        Linking.openURL('tel:+351210000000');
        break;
      case 'chat':
        Alert.alert('Chat', 'Funcionalidade de chat em desenvolvimento');
        break;
    }
  };

  const ContactCard = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={styles.contactIcon}>
        <Icon size={24} color={COLORS.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Centro de Ajuda',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Como podemos ajudar?</Text>
          <Text style={styles.headerSubtitle}>
            Encontre respostas para as perguntas mais frequentes ou entre em contato conosco
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Search size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchText}
              placeholder="Buscar ajuda..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categories}>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Icon 
                      size={16} 
                      color={selectedCategory === category.id ? COLORS.white : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          
          {filteredFAQ.length === 0 ? (
            <View style={styles.emptyState}>
              <HelpCircle size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>Nenhuma pergunta encontrada</Text>
              <Text style={styles.emptySubtext}>
                Tente buscar com outras palavras ou entre em contato conosco
              </Text>
            </View>
          ) : (
            filteredFAQ.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  {expandedFAQ === item.id ? (
                    <ChevronUp size={20} color={COLORS.primary} />
                  ) : (
                    <ChevronDown size={20} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
                
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Ainda precisa de ajuda?</Text>
          <Text style={styles.contactDescription}>
            Nossa equipe de suporte está disponível para ajudá-lo
          </Text>
          
          <ContactCard
            icon={Mail}
            title="Email"
            subtitle="suporte@lyven.com"
            onPress={() => handleContactSupport('email')}
          />
          
          <ContactCard
            icon={Phone}
            title="Telefone"
            subtitle="+351 21 000 0000"
            onPress={() => handleContactSupport('phone')}
          />
          
          <ContactCard
            icon={MessageSquare}
            title="Chat ao Vivo"
            subtitle="Disponível 24/7"
            onPress={() => handleContactSupport('chat')}
          />
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Recursos Adicionais</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Shield size={20} color={COLORS.info} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Política de Privacidade</Text>
              <Text style={styles.resourceSubtitle}>Como protegemos seus dados</Text>
            </View>
            <ExternalLink size={16} color={COLORS.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Book size={20} color={COLORS.success} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Termos de Uso</Text>
              <Text style={styles.resourceSubtitle}>Condições de utilização</Text>
            </View>
            <ExternalLink size={16} color={COLORS.gray} />
          </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.black,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 22,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.black,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: 'bold' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.headerText,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.header,
  },
  faqSection: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  contactDescription: {
    fontSize: 14,
    color: COLORS.black,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.black,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.black,
  },
  resourcesSection: {
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 16,
  },
  resourceTitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: COLORS.black,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
  },
});