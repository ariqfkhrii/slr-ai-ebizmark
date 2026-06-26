'use client';

import { ReactNode, useEffect } from 'react';
import { useGuideContext } from './GuideContext';

type Props = {
  title: string;
  content: ReactNode;
};

export default function useGuide({ title, content }: Props) {
  const { setGuide } = useGuideContext();

  useEffect(() => {
    setGuide(title, content);
  }, [title, content]);
}
