
'use client';

import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, User, Swords, Award, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/use-i18n';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const FeatureCard = ({ icon: Icon, title, description, href }: { icon: React.ElementType, title: string, description: string, href?: string }) => {
  const cardContent = (
    <motion.div
      className="bg-card p-6 rounded-lg border flex flex-col items-center text-center h-full"
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary drop-shadow-glow-primary" />
      </div>
      <h3 className="text-xl font-headline mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground flex-grow">{description}</p>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="flex flex-col h-full">{cardContent}</Link>;
  }

  return cardContent;
};


export default function WelcomePage() {
  const { t } = useI18n();

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 p-4">
        <LanguageSwitcher />
      </div>
      <motion.div
        className="container mx-auto px-4 py-8 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Trophy className="h-16 w-16 text-primary drop-shadow-glow-primary" />
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-headline font-bold mb-4">
          {t('welcome.title')}
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {t('welcome.subtitle')}
        </motion.p>

        <motion.div variants={itemVariants} className="mb-12 flex gap-4 justify-center">
          <Button asChild size="lg" className="text-lg font-bold">
            <Link href="/play" prefetch={true}>
              <Gamepad2 className="mr-2 h-6 w-6" />
              {t('welcome.cta')}
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={Wand2}
            title={t('welcome.feature1.title')}
            description={t('welcome.feature1.description')}
            href="/play/ai"
          />
          <FeatureCard
            icon={Gamepad2}
            title={t('welcome.feature2.title')}
            description={t('welcome.feature2.description')}
            href="/play"
          />
          <FeatureCard
            icon={Trophy}
            title={t('welcome.feature3.title')}
            description={t('welcome.feature3.description')}
            href="/leaderboard"
          />
          <FeatureCard
            icon={Award}
            title={t('welcome.feature4.title')}
            description={t('welcome.feature4.description')}
            href="/achievements"
          />
           <FeatureCard
            icon={User}
            title={t('welcome.feature5.title')}
            description={t('welcome.feature5.description')}
            href="/profile/me"
          />
          <FeatureCard
            icon={Swords}
            title={t('welcome.feature6.title')}
            description={t('welcome.feature6.description')}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
