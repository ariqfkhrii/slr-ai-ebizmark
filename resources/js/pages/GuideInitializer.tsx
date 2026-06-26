'use client';

import { useGuide } from './prisma/components/prisma-layout';
import IdentificationGuide from './prisma/guides/IdentificationGuide';

export default function GuideInitializer() {
  useGuide({
    title: 'Dashboard',
    content: <IdentificationGuide />,
  });

  return null;
}
