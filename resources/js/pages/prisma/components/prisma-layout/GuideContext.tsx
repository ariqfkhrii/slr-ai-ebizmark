'use client';

import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

type GuideContextType = {
  open: boolean;
  title: string;
  content: ReactNode;

  toggle: () => void;
  openGuide: () => void;
  closeGuide: () => void;

  setGuide: (title: string, content: ReactNode) => void;
};

const GuideContext = createContext<GuideContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function GuideProvider({ children }: Props) {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;

    const value = localStorage.getItem('prisma-guide');

    return value === null ? true : value === 'true';
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ReactNode>(null);

  const saveState = (value: boolean) => {
    setOpen(value);

    if (typeof window !== 'undefined') {
      localStorage.setItem('prisma-guide', String(value));
    }
  };

  const value = useMemo(
    () => ({
      open,
      title,
      content,
      toggle: () => saveState(!open),
      openGuide: () => saveState(true),
      closeGuide: () => saveState(false),
      setGuide: (title: string, content: ReactNode) => {
        setTitle(title);
        setContent(content);
      },
    }),
    [open, title, content],
  );

  return (
    <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
  );
}

export function useGuideContext() {
  const context = useContext(GuideContext);

  if (!context) {
    throw new Error('useGuideContext must be used inside GuideProvider');
  }

  return context;
}
