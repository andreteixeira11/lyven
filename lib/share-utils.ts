import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { Platform, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface ShareEventParams {
  eventId: string;
  eventTitle: string;
  platform?: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'copy' | 'system';
}

export async function shareEvent(params: ShareEventParams): Promise<boolean> {
  const { eventId, eventTitle, platform = 'system' } = params;
  
  const deepLink = Linking.createURL(`/event/${eventId}`);
  const shareMessage = `Olá! Vem comigo ao evento "${eventTitle}" 🎉\n\nCompra os teus bilhetes aqui: ${deepLink}`;
  
  try {
    if (platform === 'copy') {
      await Clipboard.setStringAsync(deepLink);
      Alert.alert('Link Copiado', 'O link do evento foi copiado para a área de transferência!');
      return true;
    }

    if (platform === 'whatsapp') {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert('WhatsApp não encontrado', 'Por favor, instala o WhatsApp para partilhar.');
        return false;
      }
    }

    if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}`;
      const canOpen = await Linking.canOpenURL(facebookUrl);
      
      if (canOpen) {
        await Linking.openURL(facebookUrl);
        return true;
      } else {
        Alert.alert('Facebook não encontrado', 'Por favor, instala o Facebook para partilhar.');
        return false;
      }
    }

    if (platform === 'instagram') {
      const instagramUrl = 'instagram://';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      
      if (canOpen) {
        await Linking.openURL(instagramUrl);
        Alert.alert(
          'Instagram', 
          'Copia este link e partilha na tua história ou publicação!',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Copiar Link', 
              onPress: async () => {
                await Clipboard.setStringAsync(deepLink);
              }
            }
          ]
        );
        return true;
      } else {
        Alert.alert('Instagram não encontrado', 'Por favor, instala o Instagram para partilhar.');
        return false;
      }
    }

    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
      const canOpen = await Linking.canOpenURL(twitterUrl);
      
      if (canOpen) {
        await Linking.openURL(twitterUrl);
        return true;
      } else {
        Alert.alert('Twitter/X não encontrado', 'Por favor, instala o Twitter para partilhar.');
        return false;
      }
    }

    if (Platform.OS === 'web') {
      const shareData = {
        title: eventTitle,
        text: shareMessage,
        url: deepLink,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        await Clipboard.setStringAsync(deepLink);
        Alert.alert('Link Copiado', 'O link do evento foi copiado!');
        return true;
      }
    }

    const shareResult = await Share.share({
      message: shareMessage,
      url: deepLink,
      title: eventTitle,
    });

    return shareResult.action !== Share.dismissedAction;
  } catch (error) {
    console.error('Error sharing event:', error);
    Alert.alert('Erro', 'Não foi possível partilhar o evento. Tenta novamente.');
    return false;
  }
}

export async function shareEventWithImage(params: ShareEventParams & { imageUri: string }): Promise<boolean> {
  const { imageUri, eventTitle } = params;
  
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      return shareEvent(params);
    }

    await Sharing.shareAsync(imageUri, {
      dialogTitle: `Partilhar ${eventTitle}`,
      mimeType: 'image/jpeg',
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing event with image:', error);
    return shareEvent(params);
  }
}

export function getDeepLink(path: string): string {
  return Linking.createURL(path);
}

export async function handleDeepLink(url: string): Promise<void> {
  try {
    const { path, queryParams } = Linking.parse(url);
    console.log('Deep link opened:', { path, queryParams });
  } catch (error) {
    console.error('Error handling deep link:', error);
  }
}
