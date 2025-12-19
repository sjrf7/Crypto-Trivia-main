
'use client';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';
import { LogOut, Wallet, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFarcasterIdentity } from '@/hooks/use-farcaster-identity';
import { useAccount } from 'wagmi';
import { useI18n } from '@/hooks/use-i18n';


export function ConnectButton() {
  const { farcasterProfile, authenticated, loading } = useFarcasterIdentity();
  const { address } = useAccount();
  const { toast } = useToast();
  const { t } = useI18n();
  
  const shortAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied!",
        description: "Your wallet address has been copied to the clipboard.",
      });
    }
  }

  if (loading) {
    return <Button variant="outline" className="h-10 w-28 animate-pulse" disabled />
  }

  if (!authenticated || !farcasterProfile) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-secondary">
          <User className="h-5 w-5 text-primary"/>
          <span className="hidden sm:inline">{t('profile.sign_in.description')}</span>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={farcasterProfile.pfp_url} alt={farcasterProfile.display_name || 'User PFP'} data-ai-hint="profile picture" />
              <AvatarFallback>{farcasterProfile.display_name?.substring(0, 2) || '??'}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            {farcasterProfile.display_name || shortAddress(address)}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{farcasterProfile.display_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{farcasterProfile.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile/me">
            My Profile
          </Link>
        </DropdownMenuItem>
        {address && (
          <DropdownMenuItem onClick={copyAddress}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
