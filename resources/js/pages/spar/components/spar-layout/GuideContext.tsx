'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type GuideContextType = {
  open: boolean;
  title: string;
  content: ReactNode | null;

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
  const [content, setContent] = useState<ReactNode | null>(null);

  const prevTitleRef = useRef('');
  const prevContentRef = useRef<ReactNode | null>(null);

  const saveState = useCallback((value: boolean) => {
    setOpen(value);

    if (typeof window !== 'undefined') {
      localStorage.setItem('prisma-guide', String(value));
    }
  }, []);

  const setGuide = useCallback((newTitle: string, newContent: ReactNode) => {
    const titleChanged = prevTitleRef.current !== newTitle;
    const contentChanged = prevContentRef.current !== newContent;

    if (titleChanged || contentChanged) {
      prevTitleRef.current = newTitle;
      prevContentRef.current = newContent;
      setTitle(newTitle);
      setContent(newContent);
    }
  }, []);

  const toggle = useCallback(() => {
    saveState(!open);
  }, [open, saveState]);

  const openGuide = useCallback(() => {
    saveState(true);
  }, [saveState]);

  const closeGuide = useCallback(() => {
    saveState(false);
  }, [saveState]);

  const value = useMemo(
    () => ({
      open,
      title,
      content,
      toggle,
      openGuide,
      closeGuide,
      setGuide,
    }),
    [open, title, content, toggle, openGuide, closeGuide, setGuide],
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
