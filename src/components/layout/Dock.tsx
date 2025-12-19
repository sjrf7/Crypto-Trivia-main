
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

const navLinks = [
  { href: '/play', label: 'Play', icon: 'gamepad' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { href: '/achievements', label: 'Achievements', icon: 'award' },
];

const iconVariants = {
  initial: {
      pathLength: 1,
      opacity: 1
  },
  hover: {
    pathLength: [1, 0, 1],
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
};

const icons: { [key: string]: React.ReactNode } = {
    gamepad: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="11" x2="10" y2="11" />
            <line x1="8" y1="9" x2="8" y2="13" />
            <path d="M13 13h4v4h-4z" />
            <motion.path d="M4 15c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4z" variants={iconVariants} />
        </svg>
    ),
    trophy: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" variants={iconVariants} />
        <motion.path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" variants={iconVariants} />
        <motion.path d="M4 22h16" variants={iconVariants} />
        <motion.path d="M10 14.66V17c0 .55-.47.98-.97 1.21A3.5 3.5 0 0 1 8.5 19H8a2.5 2.5 0 0 1-2.5-2.5V14" variants={iconVariants} />
        <motion.path d="M14 14.66V17c0 .55.47.98.97 1.21A3.5 3.5 0 0 0 15.5 19h.5a2.5 2.5 0 0 0 2.5-2.5V14" variants={iconVariants} />
        <motion.path d="M9 12H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5" variants={iconVariants} />
        <motion.path d="M12 15V9.5" variants={iconVariants} />
      </svg>
    ),
    award: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <motion.circle cx="12" cy="8" r="6" variants={iconVariants} />
            <motion.path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" variants={iconVariants} />
        </svg>
    ),
};

export function Dock() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="container grid grid-cols-3 items-center justify-items-center h-full text-center">
          {navLinks.map((link) => (
             <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className="flex items-center justify-center h-full w-full"
                onMouseEnter={() => setHovered(link.href)}
                onMouseLeave={() => setHovered(null)}
              >
                <motion.div
                  className={cn(
                      "flex flex-col items-center justify-center h-full w-full rounded-lg transition-colors p-2",
                      pathname.startsWith(link.href) && link.href !== '/play' || pathname === link.href ? 'text-primary' : 'text-foreground/60'
                  )}
                  whileTap={{ scale: 0.9, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  initial="initial"
                  animate={hovered === link.href ? 'hover' : 'initial'}
                >
                  {icons[link.icon]}
                </motion.div>
              </Link>
          ))}
      </nav>
    </div>
  );
}
