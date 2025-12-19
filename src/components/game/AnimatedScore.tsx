'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedScoreProps {
  score: number;
}

export function AnimatedScore({ score }: AnimatedScoreProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = parseInt(node.textContent || '0', 10);
    if (from === score) return;

    const controls = animate(from, score, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate(value) {
        node.textContent = Math.round(value).toString();
      },
    });

    return () => controls.stop();
  }, [score]);

  return <span ref={nodeRef}>{0}</span>;
}
