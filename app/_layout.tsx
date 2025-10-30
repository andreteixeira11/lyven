import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, LogBox } from "react-native";
import { CartProvider } from "@/hooks/cart-context";
import { UserProvider } from "@/hooks/user-context";
import { FavoritesContext } from "@/hooks/favorites-context";
import { CalendarProvider } from "@/hooks/calendar-context";
import { SocialProvider } from "@/hooks/social-context";
import { NotificationsContext } from "@/hooks/notifications-context";
import { ThemeProvider, useTheme } from "@/hooks/theme-context";
import { OfflineProvider } from "@/hooks/offline-context";
import { I18nProvider } from "@/hooks/i18n-context";
import { trpc, trpcReactClient } from "@/lib/trpc";

LogBox.ignoreLogs([
  'deep imports from the "react-native" package are deprecated',
]);



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Voltar",
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
      headerTitleStyle: {
        fontWeight: 'bold' as const,
        color: colors.white,
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="event/[id]" 
        options={{ 
          title: 'Evento',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: 'Finalizar Compra',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="my-tickets" 
        options={{ 
          title: 'Meus Ingressos',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="promoter-dashboard" 
        options={{ 
          title: 'Dashboard',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: 'Estatísticas',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="my-events" 
        options={{ 
          title: 'Meus Eventos',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="followers" 
        options={{ 
          title: 'Seguidores',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="event-buyers/[id]" 
        options={{ 
          title: 'Compradores',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="qr-scanner/[id]" 
        options={{ 
          title: 'Scanner QR',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="create-event" 
        options={{ 
          title: 'Criar Evento',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="admin-dashboard" 
        options={{ 
          title: 'Administração',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-approvals" 
        options={{ 
          title: 'Aprovar Publicidades',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-users" 
        options={{ 
          title: 'Gerir Utilizadores',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-analytics" 
        options={{ 
          title: 'Estatísticas Admin',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-events" 
        options={{ 
          title: 'Gerir Eventos',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-promoters" 
        options={{ 
          title: 'Gerir Promotores',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-settings" 
        options={{ 
          title: 'Configurações',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Definições',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Notificações',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          title: 'Ajuda',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="faq" 
        options={{ 
          title: 'FAQ',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="ad-purchase" 
        options={{ 
          title: 'Comprar Anúncio',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="promoter-event/[id]" 
        options={{ 
          title: 'Gerir Evento',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Editar Perfil',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="security" 
        options={{ 
          title: 'Segurança',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="email-preferences" 
        options={{ 
          title: 'Preferências de Email',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="test-backend" 
        options={{ 
          title: 'Testar Backend',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="test-email" 
        options={{ 
          title: 'Testar Email',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="ticket-details/[id]" 
        options={{ 
          title: 'Detalhes do Bilhete',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="buyer-details/[id]" 
        options={{ 
          title: 'Detalhes do Comprador',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: 'Recuperar Senha',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-login" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="seed-admin" 
        options={{ 
          title: 'Criar Admin',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="theme-settings" 
        options={{ 
          title: 'Tema',
          presentation: 'card'
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <OfflineProvider>
              <UserProvider>
                <NotificationsContext>
                  <FavoritesContext>
                    <CalendarProvider>
                      <SocialProvider>
                        <CartProvider>
                          <GestureHandlerRootView style={styles.container}>
                            <RootLayoutNav />
                          </GestureHandlerRootView>
                        </CartProvider>
                      </SocialProvider>
                    </CalendarProvider>
                  </FavoritesContext>
                </NotificationsContext>
              </UserProvider>
            </OfflineProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}