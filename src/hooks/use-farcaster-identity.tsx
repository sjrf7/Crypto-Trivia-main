
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the user profile structure based on what your API returns
export interface FarcasterUserProfile {
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  bio?: string;
}

interface FarcasterIdentityContextType {
  farcasterProfile: FarcasterUserProfile | null;
  loading: boolean;
  authenticated: boolean;
}

const FarcasterIdentityContext = createContext<FarcasterIdentityContextType | undefined>(undefined);

export function FarcasterIdentityProvider({ children }: { children: ReactNode }) {
  const [farcasterProfile, setFarcasterProfile] = useState<FarcasterUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkFarcasterIdentity = async () => {
      setLoading(true);
      try {
        // 1. Try to get identity from Farcaster SDK Context (Mini App)
        // Note: We need to wait for the SDK to be ready or check if it's already there
        // In a real mini app, the SDK initializes and provides context.
        if (typeof window !== 'undefined' && window.FarcasterSDK && window.FarcasterSDK.context) {
          const context = await window.FarcasterSDK.context; // Ensure we await if it's a promise in the specific SDK version
          if (context && context.user) {
            setFarcasterProfile({
              fid: context.user.fid,
              username: context.user.username,
              display_name: context.user.displayName,
              pfp_url: context.user.pfpUrl,
              // bio is not always in context.user, might need separate fetch if critical
            });
            setAuthenticated(true);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback: Local testing via signer_uuid
        const urlParams = new URLSearchParams(window.location.search);
        const signerUuid = urlParams.get('signer_uuid') || process.env.NEXT_PUBLIC_NEYNAR_SIGNER_UUID;

        if (signerUuid) {
          const response = await fetch(`/api/me?signer_uuid=${signerUuid}`);
          if (response.ok) {
            const userData = await response.json();
            setFarcasterProfile(userData);
            setAuthenticated(true);
          } else {
            console.warn('Could not authenticate Farcaster user via API.');
            setAuthenticated(false);
          }
        } else {
          // Not in a client or no signer_uuid available
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking Farcaster identity:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // We might need to wait for the SDK to be ready. 
    // A simple timeout or event listener could be better, but for now let's just run it.
    // If the SDK loads AFTER this hook, we might miss it. 
    // However, since we load the script in layout with strategy="beforeInteractive", it should be there.
    checkFarcasterIdentity();
  }, []);

  const value = {
    farcasterProfile,
    loading,
    authenticated
  };

  return (
    <FarcasterIdentityContext.Provider value={value}>
      {children}
    </FarcasterIdentityContext.Provider>
  );
}

export function useFarcasterIdentity() {
  const context = useContext(FarcasterIdentityContext);
  if (context === undefined) {
    throw new Error('useFarcasterIdentity must be used within a FarcasterIdentityProvider');
  }
  return context;
}
