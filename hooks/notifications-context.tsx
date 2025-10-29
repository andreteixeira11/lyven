import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import { useUser } from './user-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'hfa30k1ymcso2y545gvqm',
    })).data;
    console.log('Token de notificação:', token);
  } else {
    console.log('Deve usar um dispositivo físico para notificações push');
  }

  return token;
}

export const [NotificationsContext, useNotifications] = createContextHook(() => {

  const { user } = useUser();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const registerTokenMutation = trpc.notifications.registerToken.useMutation();
  const notificationsQuery = trpc.notifications.list.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );

  useEffect(() => {
    if (!user?.id) return;

    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && user.id) {
        const platform = Platform.OS === 'ios' 
          ? 'ios' 
          : Platform.OS === 'android' 
          ? 'android' 
          : 'web';
        
        registerTokenMutation.mutate({
          userId: user.id,
          token,
          platform,
        });
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
      setNotification(notification);
      notificationsQuery.refetch();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta à notificação:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const refetchNotifications = useCallback(() => {
    return notificationsQuery.refetch();
  }, [notificationsQuery]);

  return useMemo(
    () => ({
      expoPushToken,
      notification,
      notifications: notificationsQuery.data || [],
      refetchNotifications,
    }),
    [expoPushToken, notification, notificationsQuery.data, refetchNotifications]
  );
});
