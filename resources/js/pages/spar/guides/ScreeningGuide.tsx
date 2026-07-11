'use client';

import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function ScreeningGuide() {
  return (
    <>
      <GuideInfo>
        Tahap Screening digunakan untuk menghapus artikel yang tidak relevan.
      </GuideInfo>

      <GuideSection title="Workflow">
        <GuideStep
          number={1}
          title="Review Judul"
          description="Periksa kesesuaian judul artikel."
        />

        <GuideStep
          number={2}
          title="Review Abstract"
          description="Baca abstract sebelum melakukan exclude."
        />

        <GuideStep
          number={3}
          title="Tetapkan Status"
          description="Masukkan artikel ke Include atau Exclude."
        />
      </GuideSection>
    </>
  );
}
