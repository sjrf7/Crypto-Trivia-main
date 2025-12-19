'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import sdk from '@farcaster/miniapp-sdk';

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
        // We call ready() here to signal the app is initialized (safe to call multiple times)
        try {
          if (sdk?.actions?.ready) {
            sdk.actions.ready();
          }
        } catch (err) {
          console.error("Failed to call sdk.actions.ready:", err);
        }

        const context = await sdk.context;
        if (context && context.user) {
          setFarcasterProfile({
            fid: context.user.fid,
            username: context.user.username,
            display_name: context.user.displayName,
            pfp_url: context.user.pfpUrl,
          });
          setAuthenticated(true);
          setLoading(false);

          // Auto-subscribe/Add Frame request
          try {
            // Cast to any because addFrame might be missing in type definition if it's new/beta
            if ((sdk.actions as any).addFrame) {
              await (sdk.actions as any).addFrame();
            }
          } catch (e) {
            console.error("Failed to auto-add frame:", e);
          }
          return;
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
