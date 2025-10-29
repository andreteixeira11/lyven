import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { CartItem, PurchasedTicket } from '@/types/event';
import { trpcClient } from '@/lib/trpc';

interface CartContextType {
  cartItems: CartItem[];
  purchasedTickets: PurchasedTicket[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  completePurchase: (userId: string) => Promise<boolean>;
}

export const [CartProvider, useCart] = createContextHook<CartContextType>(() => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const loadData = async () => {
        try {
          const [storedCart, storedTickets] = await Promise.all([
            AsyncStorage.getItem('cart'),
            AsyncStorage.getItem('purchasedTickets')
          ]);
          
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
          if (storedTickets) {
            setPurchasedTickets(JSON.parse(storedTickets));
          }
        } catch (error) {
          console.error('Error loading data from storage:', error);
        }
      };
      loadData();
      setInitialized(true);
    }
  }, [initialized]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save purchased tickets to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
  }, [purchasedTickets]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        i => i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
      );
      
      if (existingItem) {
        return prev.map(i =>
          i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      
      return [...prev, item];
    });
  };

  const removeFromCart = (eventId: string, ticketTypeId: string) => {
    setCartItems(prev =>
      prev.filter(i => !(i.eventId === eventId && i.ticketTypeId === ticketTypeId))
    );
  };

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(eventId, ticketTypeId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.ticketTypeId === ticketTypeId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const completePurchase = async (userId: string): Promise<boolean> => {
    try {
      const ticketsToCreate = cartItems.map((item) => {
        const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const qrCode = `QR_${item.eventId}_${item.ticketTypeId}_${Date.now()}`;
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + 6);

        return {
          id: ticketId,
          eventId: item.eventId,
          userId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          price: item.price,
          qrCode,
          validUntil: validUntil.toISOString(),
        };
      });

      await trpcClient.tickets.batchCreate.mutate({ tickets: ticketsToCreate });

      const newTickets: PurchasedTicket[] = cartItems.map((item) => ({
        id: `ticket_${Date.now()}_${Math.random()}`,
        eventId: item.eventId,
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        purchaseDate: new Date(),
        qrCode: `QR_${item.eventId}_${item.ticketTypeId}_${Date.now()}`,
      }));

      setPurchasedTickets((prev) => [...prev, ...newTickets]);
      clearCart();
      return true;
    } catch (error) {
      console.error('Error completing purchase:', error);
      return false;
    }
  };

  return {
    cartItems,
    purchasedTickets,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    completePurchase
  };
});