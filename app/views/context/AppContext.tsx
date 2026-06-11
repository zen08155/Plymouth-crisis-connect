import React, { createContext, useContext, useState, useEffect } from 'react';

/*
  NL (voor backend-team):
  ------------------------------------------------------------------
  Dit is een TIJDELIJKE front-end mock van de auth/verificatie-state.
  Alles wordt nu in localStorage bewaard zodat de demo werkt zonder server.
  Vervang later 'login', 'register', 'submitVerification' en 'setVerification'
  door echte API-calls (bijv. Firebase). De rest van de UI gebruikt alleen
  deze functies, dus je hoeft de componenten niet aan te passen.
  ------------------------------------------------------------------
*/

export type Role = 'volunteer' | 'coordinator' | 'system_manager' | 'admin';
export type VerificationStatus = 'not_submitted' | 'under_review' | 'verified' | 'rejected';

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  verification: VerificationStatus;
  name: string;
}

interface AppContextValue extends AuthState {
  // Auth
  login: (role?: Role) => void;
  register: (name?: string) => void;
  logout: () => void;
  // Verificatie
  submitVerification: () => void;
  setVerification: (status: VerificationStatus) => void;
  // Sidebar UI
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const STORAGE_KEY = 'pcc_auth';

const DEFAULT_STATE: AuthState = {
  isAuthenticated: false,
  role: 'volunteer',
  verification: 'not_submitted',
  name: '',
};

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    /* negeer parse-fouten */
  }
  return DEFAULT_STATE;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bewaar state in localStorage bij elke wijziging
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value: AppContextValue = {
    ...state,

    // Bestaande gebruiker logt in -> direct naar de app (geen onboarding)
    login: (role = 'volunteer') =>
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        role,
      })),

    // Nieuwe gebruiker registreert -> moet nog de welcome/onboarding doen
    register: (name = '') =>
      setState({
        isAuthenticated: true,
        role: 'volunteer',
        verification: 'not_submitted',
        name,
      }),

    logout: () => {
      // Ook de backend-login sleutel (main) wissen
      localStorage.removeItem('plymouth-user');
      setState(DEFAULT_STATE);
    },

    // Welcome-pagina ingevuld met certificaten -> status 'onder review'
    submitVerification: () =>
      setState(prev => ({ ...prev, verification: 'under_review' })),

    // Admin keurt goed/af in het verificatie-dashboard
    setVerification: (status: VerificationStatus) =>
      setState(prev => ({ ...prev, verification: status })),

    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
