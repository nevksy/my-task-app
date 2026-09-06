import type { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True until the initial session check resolves. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
