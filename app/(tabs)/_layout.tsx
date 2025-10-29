import { Tabs } from "expo-router";
import { Search, Ticket, Home, User, BarChart3, Calendar, Target, Users, Eye, Settings as SettingsIcon, TrendingUp } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useCart } from "@/hooks/cart-context";
import { useUser } from "@/hooks/user-context";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
  const { getTotalItems } = useCart();
  const { user } = useUser();
  const totalItems = getTotalItems();
  const isPromoter = user?.userType === 'promoter';
  const isAdmin = user?.email === 'geral@lyven.pt';

  const AnimatedTabIcon = ({ 
    Icon, 
    color, 
    focused, 
    children 
  }: { 
    Icon: any; 
    color: string; 
    focused: boolean; 
    children?: React.ReactNode;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (focused) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();

        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    }, [focused, scaleAnim, bounceAnim]);

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: scaleAnim },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -2],
                }),
              },
            ],
          },
        ]}
      >
        <Icon size={24} color={color} />
        {children}
      </Animated.View>
    );
  };

  if (isAdmin) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.tabBarActive,
          tabBarInactiveTintColor: COLORS.tabBarInactive,
          tabBarStyle: {
            backgroundColor: COLORS.tabBar,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={BarChart3} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Utilizadores",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Users} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Aprovações",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Eye} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="ad-purchase"
          options={{
            title: "Estatísticas",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={TrendingUp} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Definições",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={SettingsIcon} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="promoter-events"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  if (isPromoter) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.tabBarActive,
          tabBarInactiveTintColor: COLORS.tabBarInactive,
          tabBarStyle: {
            backgroundColor: COLORS.tabBar,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={BarChart3} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="promoter-events"
          options={{
            title: "Eventos",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Calendar} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="ad-purchase"
          options={{
            title: "Anúncios",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={Target} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Procurar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Bilhetes",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={Ticket} color={color} focused={focused}>
              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              )}
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="promoter-events"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ad-purchase"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
});