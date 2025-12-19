
'use client';

import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '../ui/button';
import { Bell, CheckCheck, Swords, Trophy, Music } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useMusic } from './BackgroundMusic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ConnectButton } from '../profile/ConnectButton';


function Notifications() {
    const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();
    const { t } = useI18n();

    const getIcon = (type: 'achievement' | 'challenge') => {
        if (type === 'achievement') {
            return <AvatarFallback className="bg-accent/20"><Trophy className="h-5 w-5 text-accent" /></AvatarFallback>
        }
        return <AvatarFallback className="bg-primary/20"><Swords className="h-5 w-5 text-primary" /></AvatarFallback>
    }

    return (
        <Popover onOpenChange={(open) => {
            if (open && unreadCount > 0) {
                // Mark all as read when opening the popover
                markAsRead();
            }
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground/60 hover:text-primary transition-colors"/>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mr-4" align="end">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-lg">{t('notifications.title')}</h3>
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={clearAll} disabled={notifications.length === 0}>
                                <CheckCheck className="h-4 w-4"/>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('notifications.clear_all')}</p>
                          </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
                <ScrollArea className="h-80">
                    <div className="flex flex-col gap-4 pr-4">
                        {notifications.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                <Bell className="mx-auto h-12 w-12 mb-4"/>
                                <p>{t('notifications.empty.title')}</p>
                                <p className="text-sm">{t('notifications.empty.description')}</p>
                            </div>
                        ) : (
                           notifications.map(notification => (
                             <div key={notification.id} className={cn("flex items-start gap-4 p-3 rounded-lg", !notification.read && "bg-primary/10")}>
                               <Avatar className="h-9 w-9">
                                  {getIcon(notification.type)}
                               </Avatar>
                               <div className="grid gap-1">
                                 <p className="font-semibold">{notification.title}</p>
                                 <p className="text-sm text-muted-foreground">{notification.description}</p>
                                 <p className="text-xs text-muted-foreground">
                                   {new Date(notification.timestamp).toLocaleString()}
                                 </p>
                               </div>
                             </div>
                           ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

function MusicToggle() {
    const { isPlaying, toggleMusic } = useMusic();

    return (
        <Button onClick={toggleMusic} variant="ghost" size="icon">
            {isPlaying ? (
                <Music className="h-5 w-5 text-foreground/60 hover:text-primary transition-colors" />
            ) : (
                <div className="relative">
                    <Music className="h-5 w-5 text-destructive" />
                    <div className="absolute top-1/2 left-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-destructive" />
                </div>
            )}
            <span className="sr-only">Toggle Music</span>
        </Button>
    )
}

export function Header() {
    const pathname = usePathname();

    if (pathname === '/') {
        return null; // Don't show header on the welcome page
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/play" className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-primary drop-shadow-glow-primary" />
                        <span className="font-bold font-headline hidden sm:inline-block">Crypto Trivia</span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                    <MusicToggle />
                    <LanguageSwitcher />
                    <Notifications />
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
