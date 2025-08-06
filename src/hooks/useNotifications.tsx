import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'quote_response' | 'quote_update' | 'quote_status_change';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Subscribe to quote updates for customers
    const quoteChannel = supabase
      .channel('quote-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Quote update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const newNotification: Notification = {
              id: `quote-${payload.new.id}-${Date.now()}`,
              type: 'quote_update',
              title: 'Quote Updated',
              message: `Your quote status has been updated to: ${payload.new.status}`,
              timestamp: new Date().toISOString(),
              read: false,
              data: payload.new
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast({
              title: "Quote Updated",
              description: `Your quote status: ${payload.new.status}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to quote responses for customers
    const responseChannel = supabase
      .channel('quote-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quote_responses'
        },
        async (payload) => {
          console.log('New quote response:', payload);
          
          // Check if this response is for the current user's quote
          const { data: quote } = await supabase
            .from('quotes')
            .select('user_id, from_location, to_location')
            .eq('id', payload.new.quote_id)
            .single();

          if (quote?.user_id === user.id) {
            const { data: mover } = await supabase
              .from('movers')
              .select('company_name')
              .eq('id', payload.new.mover_id)
              .single();

            const newNotification: Notification = {
              id: `response-${payload.new.id}-${Date.now()}`,
              type: 'quote_response',
              title: 'New Quote Response',
              message: `${mover?.company_name || 'A mover'} responded to your quote with $${payload.new.quoted_price}`,
              timestamp: new Date().toISOString(),
              read: false,
              data: payload.new
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast({
              title: "New Quote Response!",
              description: `${mover?.company_name || 'A mover'} quoted $${payload.new.quoted_price}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to quote updates for movers (when customers update quotes)
    const moverQuoteChannel = supabase
      .channel('mover-quote-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes'
        },
        async (payload) => {
          console.log('Quote update for mover:', payload);
          
          // Check if user is a mover
          const { data: moverProfile } = await supabase
            .from('movers')
            .select('id, company_name')
            .eq('user_id', user.id)
            .maybeSingle();

          if (moverProfile && payload.eventType === 'INSERT') {
            const newNotification: Notification = {
              id: `new-quote-${payload.new.id}-${Date.now()}`,
              type: 'quote_update',
              title: 'New Quote Available',
              message: `New moving request from ${payload.new.from_location} to ${payload.new.to_location}`,
              timestamp: new Date().toISOString(),
              read: false,
              data: payload.new
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast({
              title: "New Quote Request!",
              description: `Moving from ${payload.new.from_location} to ${payload.new.to_location}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quoteChannel);
      supabase.removeChannel(responseChannel);
      supabase.removeChannel(moverQuoteChannel);
    };
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};