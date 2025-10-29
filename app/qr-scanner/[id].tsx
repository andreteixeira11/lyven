import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform
} from 'react-native';
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Flashlight,
  FlashlightOff,
  Camera
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { mockEvents } from '@/mocks/events';

interface ScannedTicket {
  id: string;
  eventId: string;
  buyerName: string;
  ticketType: string;
  quantity: number;
  isValid: boolean;
  isAlreadyUsed: boolean;
  validatedAt?: Date;
}

export default function QRScannerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScannedTicket, setLastScannedTicket] = useState<ScannedTicket | null>(null);
  const [validatedTickets, setValidatedTickets] = useState<string[]>([]);
  
  const event = mockEvents.find(e => e.id === id);
  
  // Mock ticket validation database
  const mockTicketDatabase: Record<string, ScannedTicket> = {
    'QR_1_VIP_1737123456': {
      id: '1',
      eventId: '1',
      buyerName: 'João Silva',
      ticketType: 'VIP',
      quantity: 2,
      isValid: true,
      isAlreadyUsed: false
    },
    'QR_1_GERAL_1737456789': {
      id: '2',
      eventId: '1',
      buyerName: 'Maria Santos',
      ticketType: 'Geral',
      quantity: 1,
      isValid: true,
      isAlreadyUsed: false
    },
    'QR_1_GERAL_1737789012': {
      id: '3',
      eventId: '1',
      buyerName: 'Pedro Costa',
      ticketType: 'Geral',
      quantity: 4,
      isValid: true,
      isAlreadyUsed: false
    },
    'QR_1_VIP_1738012345': {
      id: '4',
      eventId: '1',
      buyerName: 'Ana Ferreira',
      ticketType: 'VIP',
      quantity: 1,
      isValid: true,
      isAlreadyUsed: false
    },
    'QR_INVALID_123': {
      id: 'invalid',
      eventId: '999',
      buyerName: 'Ticket Inválido',
      ticketType: 'N/A',
      quantity: 0,
      isValid: false,
      isAlreadyUsed: false
    }
  };
  
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);
  
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Validate ticket
    const ticket = mockTicketDatabase[data];
    
    if (!ticket) {
      // Invalid QR code
      handleInvalidTicket('QR Code não reconhecido');
      return;
    }
    
    if (!ticket.isValid) {
      // Invalid ticket
      handleInvalidTicket('Bilhete inválido');
      return;
    }
    
    if (ticket.eventId !== id) {
      // Wrong event
      handleInvalidTicket('Bilhete não é para este evento');
      return;
    }
    
    if (validatedTickets.includes(data)) {
      // Already validated
      handleInvalidTicket('Bilhete já foi validado');
      return;
    }
    
    // Valid ticket
    handleValidTicket(ticket, data);
  };
  
  const handleValidTicket = (ticket: ScannedTicket, qrCode: string) => {
    // Add haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    
    const validatedTicket = {
      ...ticket,
      isAlreadyUsed: true,
      validatedAt: new Date()
    };
    
    setLastScannedTicket(validatedTicket);
    setValidatedTickets(prev => [...prev, qrCode]);
    
    // Show success message
    setTimeout(() => {
      Alert.alert(
        '✅ Bilhete Válido',
        `Comprador: ${ticket.buyerName}\nTipo: ${ticket.ticketType}\nQuantidade: ${ticket.quantity}`,
        [
          { 
            text: 'Continuar Scanning', 
            onPress: () => setScanned(false) 
          }
        ]
      );
    }, 500);
  };
  
  const handleInvalidTicket = (reason: string) => {
    // Add error haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500]);
    }
    
    Alert.alert(
      '❌ Bilhete Inválido',
      reason,
      [
        { 
          text: 'Tentar Novamente', 
          onPress: () => setScanned(false) 
        }
      ]
    );
  };
  
  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };
  
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>A solicitar permissões da câmera...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#666" />
          <Text style={styles.permissionTitle}>Permissão da Câmera Necessária</Text>
          <Text style={styles.permissionText}>
            Para validar bilhetes, precisamos de acesso à câmera para ler QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Evento não encontrado</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Scanner QR',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleFlash}>
              {flashOn ? (
                <FlashlightOff size={24} color="#fff" />
              ) : (
                <Flashlight size={24} color="#fff" />
              )}
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventVenue}>{event.venue.name}</Text>
          <Text style={styles.validatedCount}>
            {validatedTickets.length} bilhetes validados
          </Text>
        </View>
        
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            // Web fallback - show QR code input
            <View style={styles.webFallback}>
              <QrCode size={64} color="#666" />
              <Text style={styles.webFallbackText}>
                Scanner de câmera não disponível na web
              </Text>
              <Text style={styles.webFallbackSubtext}>
                Use a versão mobile para validar bilhetes
              </Text>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing={'back' as CameraType}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              enableTorch={flashOn}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={styles.scanCorner} />
                  <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                </View>
                
                <Text style={styles.scanInstructions}>
                  Aponte a câmera para o QR code do bilhete
                </Text>
              </View>
            </CameraView>
          )}
        </View>
        
        {/* Last Scanned Ticket */}
        {lastScannedTicket && (
          <View style={styles.lastScannedContainer}>
            <View style={styles.lastScannedHeader}>
              <CheckCircle size={20} color="#28A745" />
              <Text style={styles.lastScannedTitle}>Último Bilhete Validado</Text>
            </View>
            <View style={styles.lastScannedInfo}>
              <Text style={styles.lastScannedName}>{lastScannedTicket.buyerName}</Text>
              <Text style={styles.lastScannedDetails}>
                {lastScannedTicket.ticketType} • {lastScannedTicket.quantity} bilhete(s)
              </Text>
              {lastScannedTicket.validatedAt && (
                <Text style={styles.lastScannedTime}>
                  Validado às {new Intl.DateTimeFormat('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(lastScannedTicket.validatedAt)}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Manual Reset Button */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setScanned(false)}
            disabled={!scanned}
          >
            <QrCode size={20} color={scanned ? "#666" : "#fff"} />
            <Text style={[
              styles.resetButtonText,
              { color: scanned ? "#666" : "#fff" }
            ]}>
              {scanned ? 'Processando...' : 'Pronto para Scan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  eventInfo: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  validatedCount: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: 'bold' as const,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  webFallbackText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF385C',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  scanCornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    right: 0,
    left: 'auto' as any,
  },
  scanCornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto' as any,
  },
  scanCornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto' as any,
    left: 'auto' as any,
  },
  scanInstructions: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lastScannedContainer: {
    margin: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  lastScannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  lastScannedTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#28A745',
  },
  lastScannedInfo: {
    marginLeft: 28,
  },
  lastScannedName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  lastScannedDetails: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  lastScannedTime: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    padding: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});