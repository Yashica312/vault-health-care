import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile, AppNotification, Relation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/api/profile';
import { listFamilyMembers, addFamilyMember } from '@/lib/api/family';
import { listNotifications, markAllNotificationsRead } from '@/lib/api/notifications';
import type { FamilyMember, Profile as SupabaseProfile, AppNotification as SupabaseNotification } from '@/lib/api/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  userPhone: string;
}

interface AppContextValue {
  auth: AuthState;
  login: (name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  profiles: Profile[];
  activeProfile: Profile;
  setActiveProfileId: (id: string) => void;
  addProfile: (p: Omit<Profile, 'id'>) => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const EMPTY_PROFILE: Profile = {
  id: 'profile-empty',
  name: 'Vault User',
  relation: 'self',
  age: 0,
  bloodGroup: 'Unknown',
  emergencyContact: '',
  allergies: [],
  avatarColor: 'hsl(221 83% 53%)',
};

const blankAuth = (): AuthState => ({ isAuthenticated: false, isLoading: false, userName: '', userPhone: '' });

const normalizeSupabaseProfile = (row: SupabaseProfile | null): Profile => {
  if (!row) return EMPTY_PROFILE;
  return {
    id: row.id,
    name: row.full_name || 'Vault User',
    relation: 'self',
    age: 0,
    bloodGroup: 'Unknown',
    emergencyContact: row.phone || '',
    allergies: [],
    avatarColor: 'hsl(221 83% 53%)',
  };
};

const normalizeFamilyMember = (member: FamilyMember): Profile => ({
  id: member.id,
  name: member.name,
  relation: (member.relation || 'other') as Relation,
  age: member.age ?? 0,
  bloodGroup: member.blood_group || 'Unknown',
  emergencyContact: member.emergency_contact || '',
  allergies: member.allergies || [],
  avatarColor: member.avatar_color || 'hsl(221 83% 53%)',
});

const normalizeDbNotification = (notification: SupabaseNotification): AppNotification => ({
  id: notification.id,
  type: notification.type as AppNotification['type'],
  title: notification.title,
  message: notification.message,
  time: new Date(notification.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  read: !!notification.is_read,
});

const deriveAuthState = (user: any): AuthState => {
  const userName = user?.user_metadata?.full_name || user?.email || '';
  const userPhone = user?.phone || user?.user_metadata?.phone || user?.email || '';
  return {
    isAuthenticated: !!user,
    userName,
    userPhone,
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, isLoading: true, userName: '', userPhone: '' });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const clearSessionState = () => {
    setAuth({ isAuthenticated: false, isLoading: false, userName: '', userPhone: '' });
    setProfiles([]);
    setActiveProfileId('');
    setNotifications([]);
  };

  const hydrateFromSession = async (session: any) => {
    if (!session?.user) {
      clearSessionState();
      return;
    }

    try {
      const [profileRow, familyRows, notificationRows] = await Promise.all([
        getProfile(),
        listFamilyMembers(),
        listNotifications(),
      ]);

      const primaryProfile = normalizeSupabaseProfile(profileRow);
      const familyProfiles = familyRows.map(normalizeFamilyMember);
      const nextProfiles = [primaryProfile, ...familyProfiles].filter(Boolean);
      setProfiles(nextProfiles);
      const nextProfileId = primaryProfile.id || nextProfiles[0]?.id || '';
      setActiveProfileId(nextProfileId);

      const nextAuth = deriveAuthState(session.user);
      nextAuth.isLoading = false;
      if (profileRow?.full_name) {
        nextAuth.userName = profileRow.full_name;
      }
      if (profileRow?.phone) {
        nextAuth.userPhone = profileRow.phone;
      }
      setAuth(nextAuth);

      setNotifications(notificationRows.map(normalizeDbNotification));
    } catch (error) {
      console.error('Failed to hydrate Vault Health session:', error);
      clearSessionState();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          clearSessionState();
          return;
        }
        await hydrateFromSession(session);
      } catch (error) {
        console.error('Failed to read session:', error);
        if (isMounted) clearSessionState();
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        clearSessionState();
        return;
      }
      await hydrateFromSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (name: string, phone: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await hydrateFromSession(session);
        return;
      }

      const normalizedPhone = phone.trim();
      if (!normalizedPhone) {
        throw new Error('A valid phone number is required for sign-in.');
      }

      const email = `${normalizedPhone.replace(/\D/g, '')}@vault-demo.local`;
      const password = 'VaultDemo123!';

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'Vault User',
              phone: normalizedPhone,
            },
          },
        });

        if (signUpError) throw signUpError;

        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (retryError) throw retryError;
        if (!retryData.session) throw new Error('Demo authentication did not create a session.');
        await hydrateFromSession(retryData.session);
        return;
      }

      if (!signInData.session) throw new Error('Supabase authentication did not create a valid session.');
      await hydrateFromSession(signInData.session);
    } catch (error) {
      console.error('Supabase login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Supabase logout failed:', error);
    } finally {
      clearSessionState();
    }
  };

  const addProfile = async (p: Omit<Profile, 'id'>) => {
    try {
      const added = await addFamilyMember({
        name: p.name,
        relation: p.relation,
        age: p.age,
        blood_group: p.bloodGroup,
        emergency_contact: p.emergencyContact,
        allergies: p.allergies || [],
        avatar_color: p.avatarColor || 'hsl(221 83% 53%)',
      });

      const nextProfile = normalizeFamilyMember(added);
      setProfiles(current => [...current, nextProfile]);
      setActiveProfileId(nextProfile.id);
    } catch (error) {
      console.error('Failed to add family member:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(current => current.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || EMPTY_PROFILE;
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <AppContext.Provider value={{
      auth,
      login,
      logout,
      profiles,
      activeProfile,
      setActiveProfileId,
      addProfile,
      notifications,
      unreadCount,
      markAllRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};