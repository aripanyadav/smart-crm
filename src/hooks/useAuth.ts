import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error('Auth session error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch (err) {
      console.error('Failed to subscribe to auth changes:', err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
