'use client';

import { GuideProvider } from '../spar/components/spar-layout';
import UploadOtherSourceContent from './UploadOtherSourceContent';

export default function UploadOtherSourcePage() {
  return (
    <GuideProvider>
      <UploadOtherSourceContent />
    </GuideProvider>
  );
}
