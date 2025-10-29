import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Upload,
  Link2,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  Ticket,
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TicketTypeForm {
  id: string;
  name: string;
  stage: string;
  price: string;
  quantity: string;
  description: string;
}

interface EventFormData {
  title: string;
  description: string;
  venue: string;
  address: string;
  date: Date;
  time?: Date;
  category: string;
  ticketTypes: TicketTypeForm[];
  imageUrl: string;
  imageUri?: string;
}

const categories = [
  'Música',
  'Teatro',
  'Dança',
  'Comédia',
  'Festival',
  'Conferência',
  'Desporto',
  'Arte',
  'Outro'
];

const ticketStages = [
  'Early Bird',
  'Normal',
  'VIP',
  'Premium',
  'Gold',
  'Silver',
  'Bronze',
  'Mesa',
  'Pista',
  'Camarote',
  'Balcão',
  'Geral',
];

export default function CreateEvent() {
  const params = useLocalSearchParams();
  const eventId = params.id as string | undefined;
  const isEditMode = !!eventId;

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    venue: '',
    address: '',
    date: new Date(),
    time: undefined,
    category: '',
    ticketTypes: [
      {
        id: '1',
        name: 'Bilhete Normal',
        stage: '',
        price: '',
        quantity: '',
        description: '',
      },
    ],
    imageUrl: '',
    imageUri: undefined,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set(['1']));
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCancelEventModal, setShowCancelEventModal] = useState(false);

  useEffect(() => {
    if (isEditMode && eventId) {
      loadEventData(eventId);
    }
  }, [eventId]);

  const loadEventData = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('📥 Carregando dados do evento:', id);
      
      const event = await trpcClient.events.get.query({ id });
      console.log('✅ Evento carregado:', event);

      const eventDate = new Date(event.date);
      const eventTime = new Date(event.date);

      const ticketTypes = event.ticketTypes.map((ticket: any, index: number) => ({
        id: (index + 1).toString(),
        name: ticket.name,
        stage: ticket.stage || '',
        price: ticket.price.toString(),
        quantity: ticket.available.toString(),
        description: ticket.description || '',
      }));

      setFormData({
        title: event.title,
        description: event.description || '',
        venue: event.venue.name,
        address: event.venue.address,
        date: eventDate,
        time: eventTime,
        category: event.category,
        ticketTypes: ticketTypes.length > 0 ? ticketTypes : [
          {
            id: '1',
            name: 'Bilhete Normal',
            stage: '',
            price: '',
            quantity: '',
            description: '',
          },
        ],
        imageUrl: event.image,
        imageUri: undefined,
      });

      const expandedIds = new Set<string>(ticketTypes.map((t: any) => t.id as string));
      setExpandedTickets(expandedIds);

      if (event.image) {
        setImageMode('url');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar evento:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof EventFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        updateFormData('date', selectedDate);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        updateFormData('date', selectedDate);
      }
    }
    
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime && selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
        updateFormData('time', selectedTime);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedTime && selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
        updateFormData('time', selectedTime);
      }
    }
    
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title || formData.title.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o título do evento.');
      return false;
    }

    if (!formData.venue || formData.venue.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o local do evento.');
      return false;
    }

    if (!formData.address || formData.address.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o endereço do evento.');
      return false;
    }

    if (!formData.date) {
      Alert.alert('Erro', 'Por favor, selecione a data do evento.');
      return false;
    }

    if (!formData.category || formData.category.trim() === '') {
      Alert.alert('Erro', 'Por favor, selecione uma categoria.');
      return false;
    }

    if (!formData.imageUri && !formData.imageUrl) {
      Alert.alert('Erro', 'Por favor, adicione uma imagem do evento.');
      return false;
    }

    if (formData.ticketTypes.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos um tipo de bilhete.');
      return false;
    }

    const hasValidTicket = formData.ticketTypes.some(ticket => 
      ticket.name && ticket.name.trim() !== '' &&
      ticket.stage && ticket.stage.trim() !== '' &&
      ticket.price && ticket.price.trim() !== '' &&
      ticket.quantity && ticket.quantity.trim() !== ''
    );

    if (!hasValidTicket) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos um bilhete completamente.');
      return false;
    }

    for (let i = 0; i < formData.ticketTypes.length; i++) {
      const ticket = formData.ticketTypes[i];
      
      if (!ticket.name && !ticket.stage && !ticket.price && !ticket.quantity) {
        continue;
      }
      
      if (!ticket.name || ticket.name.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha o nome do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.stage || ticket.stage.trim() === '') {
        Alert.alert('Erro', `Por favor, selecione o stage do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.price || ticket.price.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha o preço do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.quantity || ticket.quantity.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha a quantidade do bilhete ${i + 1}.`);
        return false;
      }

      const price = parseFloat(ticket.price);
      const quantity = parseInt(ticket.quantity);

      if (isNaN(price) || price < 0) {
        Alert.alert('Erro', `Preço inválido no bilhete ${i + 1}.`);
        return false;
      }

      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Erro', `Quantidade inválida no bilhete ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const addTicketType = () => {
    const newId = (formData.ticketTypes.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          id: newId,
          name: '',
          stage: '',
          price: '',
          quantity: '',
          description: '',
        },
      ],
    }));
    setExpandedTickets(prev => new Set([...prev, newId]));
  };

  const removeTicketType = (id: string) => {
    if (formData.ticketTypes.length === 1) {
      Alert.alert('Erro', 'Deve ter pelo menos um tipo de bilhete.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(t => t.id !== id),
    }));
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowPublishModal(true);
  };

  const handlePublishEvent = async () => {
    setShowPublishModal(false);
    setIsSubmitting(true);

    try {
      console.log('📤 Enviando evento para backend...');
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = formData.time ? 
        `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}:00` : 
        undefined;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        venue: formData.venue,
        address: formData.address,
        date: dateStr,
        time: timeStr,
        category: formData.category,
        ticketTypes: formData.ticketTypes.filter(t => 
          t.name && t.stage && t.price && t.quantity
        ),
        imageUrl: formData.imageUrl || undefined,
        imageUri: formData.imageUri || undefined,
        promoterId: 'promoter_1',
        shouldPromote: false,
      };

      console.log('📦 Dados do evento:', eventData);

      const result = await trpcClient.events.create.mutate(eventData);
      
      console.log('✅ Evento criado:', result);
      
      Alert.alert(
        'Sucesso!',
        isEditMode ? 'Evento atualizado com sucesso.' : 'Evento publicado com sucesso. Aguardando aprovação.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Ocorreu um erro ao publicar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromoteEvent = async () => {
    setShowPublishModal(false);
    setIsSubmitting(true);

    try {
      console.log('📤 Enviando evento para backend (com promoção)...');
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = formData.time ? 
        `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}:00` : 
        undefined;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        venue: formData.venue,
        address: formData.address,
        date: dateStr,
        time: timeStr,
        category: formData.category,
        ticketTypes: formData.ticketTypes.filter(t => 
          t.name && t.stage && t.price && t.quantity
        ),
        imageUrl: formData.imageUrl || undefined,
        imageUri: formData.imageUri || undefined,
        promoterId: 'promoter_1',
        shouldPromote: true,
      };

      console.log('📦 Dados do evento (promoção):', eventData);

      const result = await trpcClient.events.create.mutate(eventData);
      
      console.log('✅ Evento criado para promoção:', result);
      
      Alert.alert(
        'Sucesso!',
        'Evento criado. Redirecionando para a página de anúncios...',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              setTimeout(() => {
                router.push('/ad-purchase');
              }, 100);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Ocorreu um erro ao criar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEvent = () => {
    setShowCancelEventModal(true);
  };

  const handleConfirmCancelEvent = async () => {
    setShowCancelEventModal(false);
    setIsSubmitting(true);

    try {
      console.log('🗑️ Cancelando evento:', eventId);
      
      Alert.alert(
        'Evento Cancelado',
        'O evento foi cancelado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao cancelar evento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao cancelar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (time?: Date): string => {
    if (!time) return 'Selecionar hora (opcional)';
    return new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(time);
  };

  const toggleTicketExpansion = (id: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isTicketFilled = (ticket: TicketTypeForm): boolean => {
    return !!(ticket.name && ticket.stage && ticket.price && ticket.quantity);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Necessitamos de acesso à galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData('imageUri', result.assets[0].uri);
      updateFormData('imageUrl', '');
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: React.ReactNode,
    multiline = false,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabel}>
        {icon}
        <Text style={styles.inputLabelText}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderDateTimePicker = (
    label: string,
    value: Date | undefined,
    onPress: () => void,
    icon: React.ReactNode,
    formatter: (date?: Date) => string
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabel}>
        {icon}
        <Text style={styles.inputLabelText}>{label}</Text>
      </View>
      <TouchableOpacity style={styles.dateTimeButton} onPress={onPress}>
        <Text style={[styles.dateTimeButtonText, !value && styles.placeholder]}>{formatter(value)}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryPicker = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabel}>
        <Tag size={20} color="#666" />
        <Text style={styles.inputLabelText}>Categoria *</Text>
      </View>
      <TouchableOpacity 
        style={styles.categoryButton} 
        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
      >
        <Text style={[styles.categoryButtonText, !formData.category && styles.placeholder]}>
          {formData.category || 'Selecionar categoria'}
        </Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>
      
      {showCategoryPicker && (
        <View style={styles.categoryListContainer}>
          <ScrollView style={styles.categoryList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryItem}
                onPress={() => {
                  if (category && category.trim()) {
                    updateFormData('category', category.trim());
                    setShowCategoryPicker(false);
                  }
                }}
              >
                <Text style={styles.categoryItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: isEditMode ? 'Editar Evento' : 'Criar Evento',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando evento...</Text>
        </View>
      ) : (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {isEditMode 
            ? 'Edite os detalhes do seu evento. As alterações serão revisadas antes da publicação.'
            : 'Preencha os detalhes do seu evento. Todos os eventos são revisados antes da publicação.'
          }
        </Text>

        {renderInput(
          'Título do Evento *',
          formData.title,
          (text) => updateFormData('title', text?.trim() || ''),
          'Ex: Concerto dos Arctic Monkeys',
          <FileText size={20} color="#666" />
        )}

        {renderInput(
          'Descrição (opcional)',
          formData.description,
          (text) => updateFormData('description', text?.trim() || ''),
          'Descreva o seu evento em detalhe...',
          <FileText size={20} color="#666" />,
          true
        )}

        {renderInput(
          'Local/Venue *',
          formData.venue,
          (text) => updateFormData('venue', text?.trim() || ''),
          'Ex: Coliseu dos Recreios',
          <MapPin size={20} color="#666" />
        )}

        {renderInput(
          'Endereço *',
          formData.address,
          (text) => updateFormData('address', text?.trim() || ''),
          'Endereço completo do evento',
          <MapPin size={20} color="#666" />
        )}

        {renderDateTimePicker(
          'Data do Evento *',
          formData.date,
          () => setShowDatePicker(true),
          <Calendar size={20} color="#666" />,
          formatDate
        )}

        {renderDateTimePicker(
          'Hora do Evento',
          formData.time,
          () => setShowTimePicker(true),
          <Clock size={20} color="#666" />,
          formatTime
        )}

        {renderCategoryPicker()}

        <View style={styles.ticketTypesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ticket size={20} color="#666" />
              <Text style={styles.sectionTitle}>Tipos de Bilhetes *</Text>
            </View>
            <TouchableOpacity onPress={addTicketType} style={styles.addButton}>
              <Plus size={18} color="#007AFF" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {formData.ticketTypes.map((ticket, index) => {
            const isExpanded = expandedTickets.has(ticket.id);
            const isFilled = isTicketFilled(ticket);
            
            return (
            <View key={ticket.id} style={[styles.ticketTypeCard, !isExpanded && isFilled && styles.ticketTypeCardCollapsed]}>
              <TouchableOpacity 
                style={styles.ticketTypeHeader}
                onPress={() => toggleTicketExpansion(ticket.id)}
                activeOpacity={0.7}
              >
                <View style={styles.ticketTypeHeaderLeft}>
                  <Text style={styles.ticketTypeTitle}>
                    {ticket.name || `Bilhete ${index + 1}`}
                  </Text>
                  {!isExpanded && isFilled && (
                    <Text style={styles.ticketTypeSubtitle}>
                      {ticket.stage} • €{ticket.price} • {ticket.quantity} bilhetes
                    </Text>
                  )}
                </View>
                <View style={styles.ticketTypeHeaderRight}>
                  {formData.ticketTypes.length > 1 && (
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        removeTicketType(ticket.id);
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                  {isExpanded ? <ChevronUp size={20} color="#007AFF" /> : <ChevronDown size={20} color="#007AFF" />}
                </View>
              </TouchableOpacity>

              {isExpanded && (
              <>
              <TextInput
                style={styles.input}
                value={ticket.name}
                onChangeText={(text) => updateTicketType(ticket.id, 'name', text)}
                placeholder="Nome do bilhete (ex: Bilhete Normal)"
                placeholderTextColor="#999"
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabelText}>Stage / Tipo</Text>
                <TouchableOpacity 
                  style={styles.stageButton} 
                  onPress={() => setShowStagePicker(showStagePicker === ticket.id ? null : ticket.id)}
                >
                  <Text style={[styles.stageButtonText, !ticket.stage && styles.placeholder]}>
                    {ticket.stage || 'Selecionar stage'}
                  </Text>
                  <ChevronDown size={20} color="#666" />
                </TouchableOpacity>
                
                {showStagePicker === ticket.id && (
                  <View style={styles.stageListContainer}>
                    <ScrollView style={styles.stageList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {ticketStages.map((stage) => (
                        <TouchableOpacity
                          key={stage}
                          style={styles.stageItem}
                          onPress={() => {
                            updateTicketType(ticket.id, 'stage', stage);
                            setShowStagePicker(null);
                          }}
                        >
                          <Text style={styles.stageItemText}>{stage}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabelText}>Preço (€)</Text>
                  <TextInput
                    style={styles.input}
                    value={ticket.price}
                    onChangeText={(text) => updateTicketType(ticket.id, 'price', text)}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabelText}>Quantidade</Text>
                  <TextInput
                    style={styles.input}
                    value={ticket.quantity}
                    onChangeText={(text) => updateTicketType(ticket.id, 'quantity', text)}
                    placeholder="100"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={ticket.description}
                onChangeText={(text) => updateTicketType(ticket.id, 'description', text)}
                placeholder="Descrição (opcional)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
              </>
              )}
            </View>
            );
          })}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputLabel}>
            <ImageIcon size={20} color="#666" />
            <Text style={styles.inputLabelText}>Imagem do Evento *</Text>
          </View>
          
          <View style={styles.imageModeSelector}>
            <TouchableOpacity 
              style={[styles.imageModeButton, imageMode === 'upload' && styles.imageModeButtonActive]}
              onPress={() => setImageMode('upload')}
            >
              <Upload size={16} color={imageMode === 'upload' ? '#007AFF' : '#666'} />
              <Text style={[styles.imageModeButtonText, imageMode === 'upload' && styles.imageModeButtonTextActive]}>
                Upload
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.imageModeButton, imageMode === 'url' && styles.imageModeButtonActive]}
              onPress={() => setImageMode('url')}
            >
              <Link2 size={16} color={imageMode === 'url' ? '#007AFF' : '#666'} />
              <Text style={[styles.imageModeButtonText, imageMode === 'url' && styles.imageModeButtonTextActive]}>
                URL
              </Text>
            </TouchableOpacity>
          </View>

          {imageMode === 'upload' ? (
            <>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Upload size={20} color="#007AFF" />
                <Text style={styles.uploadButtonText}>
                  {formData.imageUri ? 'Alterar Imagem' : 'Escolher Imagem'}
                </Text>
              </TouchableOpacity>
              {formData.imageUri && (
                <Image source={{ uri: formData.imageUri }} style={styles.imagePreview} />
              )}
            </>
          ) : (
            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(text) => {
                updateFormData('imageUrl', text?.trim() || '');
                updateFormData('imageUri', undefined);
              }}
              placeholder="https://exemplo.com/imagem.jpg"
              placeholderTextColor="#999"
            />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Evento')}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity 
            style={[styles.cancelEventButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleCancelEvent}
            disabled={isSubmitting}
          >
            <X size={20} color="#fff" />
            <Text style={styles.cancelEventButtonText}>Cancelar Evento</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
      )}

      <Modal
        visible={showDatePicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosPickerButton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.iosPickerButton, styles.iosPickerButtonDone]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showTimePicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.iosPickerButton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={[styles.iosPickerButton, styles.iosPickerButtonDone]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData.time || new Date()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.time || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.publishModalOverlay}>
          <View style={styles.publishModalContent}>
            <Text style={styles.publishModalTitle}>Publicar Evento</Text>
            <Text style={styles.publishModalSubtitle}>
              Escolha como pretende divulgar o seu evento
            </Text>

            <TouchableOpacity
              style={styles.publishModalButton}
              onPress={handlePublishEvent}
              disabled={isSubmitting}
            >
              <View style={styles.publishModalButtonIcon}>
                <Save size={24} color="#007AFF" />
              </View>
              <View style={styles.publishModalButtonContent}>
                <Text style={styles.publishModalButtonTitle}>Publicar</Text>
                <Text style={styles.publishModalButtonDescription}>
                  Publicar evento sem promoção adicional
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishModalButton, styles.publishModalButtonPromote]}
              onPress={handlePromoteEvent}
              disabled={isSubmitting}
            >
              <View style={styles.publishModalButtonIcon}>
                <Upload size={24} color="#fff" />
              </View>
              <View style={styles.publishModalButtonContent}>
                <Text style={[styles.publishModalButtonTitle, styles.publishModalButtonTitlePromote]}>
                  Promover Evento
                </Text>
                <Text style={[styles.publishModalButtonDescription, styles.publishModalButtonDescriptionPromote]}>
                  Publicar e promover com anúncios pagos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.publishModalCancelButton}
              onPress={() => setShowPublishModal(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.publishModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCancelEventModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelEventModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.cancelModalIconContainer}>
              <X size={48} color="#ff3b30" />
            </View>
            <Text style={styles.cancelModalTitle}>Cancelar Evento</Text>
            <Text style={styles.cancelModalSubtitle}>
              Tem a certeza que quer cancelar o evento?
            </Text>
            <Text style={styles.cancelModalWarning}>
              Esta ação não pode ser revertida.
            </Text>

            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButtonSecondary}
                onPress={() => setShowCancelEventModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalButtonSecondaryText}>Não</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelModalButtonPrimary, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleConfirmCancelEvent}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalButtonPrimaryText}>
                  {isSubmitting ? 'Cancelando...' : 'Sim, Cancelar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  categoryListContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryList: {
    maxHeight: 200,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  ticketTypesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f4ff',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  ticketTypeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTypeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  deleteButton: {
    padding: 4,
  },
  stageButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  stageListContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stageList: {
    maxHeight: 200,
  },
  stageItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stageItemText: {
    fontSize: 16,
    color: '#333',
  },
  ticketTypeCardCollapsed: {
    padding: 12,
  },
  ticketTypeHeaderLeft: {
    flex: 1,
  },
  ticketTypeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketTypeSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  imageModeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  imageModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imageModeButtonActive: {
    backgroundColor: '#e8f4ff',
    borderColor: '#007AFF',
  },
  imageModeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  imageModeButtonTextActive: {
    color: '#007AFF',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#e8f4ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iosPickerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  iosPickerButtonDone: {
    fontWeight: '600' as const,
  },
  iosPicker: {
    height: 200,
  },
  publishModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  publishModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  publishModalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  publishModalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  publishModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  publishModalButtonPromote: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  publishModalButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  publishModalButtonContent: {
    flex: 1,
  },
  publishModalButtonTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  publishModalButtonTitlePromote: {
    color: '#fff',
  },
  publishModalButtonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  publishModalButtonDescriptionPromote: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  publishModalCancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  publishModalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  cancelEventButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  cancelEventButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cancelModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelModalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelModalWarning: {
    fontSize: 14,
    color: '#ff3b30',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelModalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  cancelModalButtonPrimary: {
    flex: 1,
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
