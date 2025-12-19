
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/hooks/use-i18n';

const FormSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  numQuestions: z.coerce.number(),
  difficulty: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

interface GameSetupProps {
  onGameStart: (topic: string, numQuestions: number, difficulty: string) => Promise<void>;
  isLoading: boolean;
}

export function GameSetup({ onGameStart, isLoading }: GameSetupProps) {
  const { t } = useI18n();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      topic: '',
      numQuestions: 10,
      difficulty: 'Medium',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await onGameStart(data.topic, data.numQuestions, data.difficulty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/10 p-4 rounded-full mb-4 w-fit">
            <Wand2 className="h-10 w-10 text-accent drop-shadow-glow-accent" />
          </div>
          <CardTitle className="font-headline text-3xl">{t('ai_setup.title')}</CardTitle>
          <CardDescription>{t('ai_setup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ai_setup.topic.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('ai_setup.topic.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai_setup.num_questions.label')}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('ai_setup.num_questions.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="10">{t('ai_setup.num_questions.option_10')}</SelectItem>
                          <SelectItem value="30">{t('ai_setup.num_questions.option_30')}</SelectItem>
                          <SelectItem value="50">{t('ai_setup.num_questions.option_50')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai_setup.difficulty.label')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('ai_setup.difficulty.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">{t('ai_setup.difficulty.easy')}</SelectItem>
                          <SelectItem value="Medium">{t('ai_setup.difficulty.medium')}</SelectItem>
                          <SelectItem value="Hard">{t('ai_setup.difficulty.hard')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : t('ai_setup.button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
