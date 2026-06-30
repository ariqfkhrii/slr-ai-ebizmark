'use client';

import { useGuide } from './spar/components/spar-layout';
import AcquisitionGuide from './spar/guides/IdentificationGuide';

export default function GuideInitializer() {
  useGuide({
    title: 'Dashboard',
    content: <AcquisitionGuide />,
  });

  return null;
}
