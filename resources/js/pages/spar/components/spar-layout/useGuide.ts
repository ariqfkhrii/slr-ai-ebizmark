'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useGuideContext } from './GuideContext';

type Props = {
  title: string;
  content: ReactNode;
};

export function useGuide({ title, content }: Props) {
  const { setGuide } = useGuideContext();

  const isMounted = useRef(false);
  const prevTitleRef = useRef(title);
  const prevContentRef = useRef(content);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      setGuide(title, content);
      return;
    }

    if (prevTitleRef.current !== title || prevContentRef.current !== content) {
      prevTitleRef.current = title;
      prevContentRef.current = content;
      setGuide(title, content);
    }
  }, [title, content, setGuide]);
}
