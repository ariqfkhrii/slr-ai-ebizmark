import { useRef } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { FilteredArticleSummary } from '../../purification/retrieval/types';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import jsPDF from 'jspdf';

const diagramWidth = 1060;
const diagramHeight = 730;

const sectionLabels = [
  { x: 18, y: 98, width: 140, height: 104, title: 'Identification' },
  { x: 18, y: 222, width: 140, height: 216, title: 'Screening' },
  { x: 18, y: 578, width: 140, height: 100, title: 'Included' },
];

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function createPngFromSvg(svgElement: SVGSVGElement): Promise<string> {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = diagramWidth;
      canvas.height = diagramHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Unable to create canvas context'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to image'));
    };

    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

type AutoReportingFlowDiagramProps = {
  filteredArticles: FilteredArticleSummary[];
};

function isArticleIncluded(article: FilteredArticleSummary) {
  return Boolean(article.included);
}

function isArticleExcluded(article: FilteredArticleSummary) {
  return !Boolean(article.included);
}

function countIncluded(filteredArticles: FilteredArticleSummary[]) {
  return filteredArticles.filter(isArticleIncluded).length;
}

function countExcluded(filteredArticles: FilteredArticleSummary[]) {
  return filteredArticles.filter(isArticleExcluded).length;
}

function countRetrieved(filteredArticles: FilteredArticleSummary[]) {
  return filteredArticles.filter((article) => Boolean(article.retrieved)).length;
}

function countSoughtForRetrieval(filteredArticles: FilteredArticleSummary[]) {
  return filteredArticles.length - countExcluded(filteredArticles);
}

function countReportsExcludedAfterRetrieval(filteredArticles: FilteredArticleSummary[]) {
  return Math.max(0, countRetrieved(filteredArticles) - countFinalIncluded(filteredArticles));
}

function countFinalIncluded(filteredArticles: FilteredArticleSummary[]) {
  return filteredArticles.filter(
    (article) => isArticleIncluded(article) && Boolean(article.retrieved) && article.raw_article !== null,
  ).length;
}

type BoxTemplate = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle: (filteredArticles: FilteredArticleSummary[]) => string;
  fill: string;
  stroke: string;
};

const mainBoxes: BoxTemplate[] = [
  {
    x: 178,
    y: 90,
    width: 352,
    height: 100,
    title: 'Record dari database',
    subtitle: (filteredArticles) => `n = ${filteredArticles.length}`,
    fill: '#ffffff',
    stroke: '#0f172a',
  },
  {
    x: 178,
    y: 220,
    width: 352,
    height: 100,
    title: 'Record disaring',
    subtitle: (filteredArticles) => `n = ${filteredArticles.length}`,
    fill: '#ffffff',
    stroke: '#0f172a',
  },
  {
    x: 178,
    y: 350,
    width: 352,
    height: 100,
    title: 'Record yang diinklusi',
    subtitle: (filteredArticles) => `n = ${countSoughtForRetrieval(filteredArticles)}`,
    fill: '#ffffff',
    stroke: '#0f172a',
  },
  {
    x: 178,
    y: 480,
    width: 352,
    height: 100,
    title: 'Record yang memiliki full text PDF-nya',
    subtitle: (filteredArticles) => `n = ${countRetrieved(filteredArticles)}`,
    fill: '#ffffff',
    stroke: '#0f172a',
  },
  {
    x: 178,
    y: 610,
    width: 640,
    height: 96,
    title: 'Artikel yang diinklusi dan memiliki full text PDF-nya',
    subtitle: (filteredArticles) => `n = ${countFinalIncluded(filteredArticles)}`,
    fill: '#dcfce7',
    stroke: '#16a34a',
  },
];

const sideBoxes: BoxTemplate[] = [
  {
    x: 560,
    y: 220,
    width: 320,
    height: 100,
    title: 'Record dikeluarkan',
    subtitle: (filteredArticles) => `n = ${countExcluded(filteredArticles)}`,
    fill: '#fee2e2',
    stroke: '#ef4444',
  },
  {
    x: 560,
    y: 350,
    width: 320,
    height: 100,
    title: 'Record tidak memiliki full text PDF',
    subtitle: (filteredArticles) => `n = ${countSoughtForRetrieval(filteredArticles) - countRetrieved(filteredArticles)}`,
    fill: '#fee2e2',
    stroke: '#ef4444',
  },
];

export default function AutoReportingFlowDiagram({ filteredArticles }: AutoReportingFlowDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleDownloadPng = async () => {
    if (!svgRef.current) return;
    const pngDataUrl = await createPngFromSvg(svgRef.current);
    downloadDataUrl(pngDataUrl, 'prisma-flow-diagram.png');
  };

  const handleDownloadPdf = async () => {
    if (!svgRef.current) return;
    const pngDataUrl = await createPngFromSvg(svgRef.current);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / diagramWidth, pageHeight / diagramHeight);
    const imageWidth = diagramWidth * ratio;
    const imageHeight = diagramHeight * ratio;
    pdf.addImage(pngDataUrl, 'PNG', (pageWidth - imageWidth) / 2, 30, imageWidth, imageHeight);
    pdf.save('prisma-flow-diagram.pdf');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              PRISMA 2020 — SPAR - 4 - SLR
            </Typography>
            <Typography color="text.secondary">
              Tampilan PRISMA flow diagram untuk ringkasan seleksi artikel.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<ImageIcon />} onClick={handleDownloadPng}>
              Unduh Diagram (PNG)
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
              Unduh Diagram (PDF)
            </Button>
          </Box>
        </Stack>

        <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 3 }}>
          {[
            { label: 'Record dari database', value: filteredArticles.length, color: '#dbeafe' },
            { label: 'Record diinklusi', value: countIncluded(filteredArticles), color: '#dcfce7' },
            { label: 'Record diekslusi', value: countExcluded(filteredArticles), color: '#fee2e2' },
            { label: 'Record akhir yang digunakan', value: countRetrieved(filteredArticles), color: '#fef9c3' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: item.color,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                minWidth: 170,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#0f172a', mb: 1 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {item.value} Record
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ width: `${diagramWidth}px`, minWidth: `${diagramWidth}px`, mx: 'auto', py: 2, px: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <svg
              ref={svgRef}
              width={diagramWidth}
              height={diagramHeight}
              viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="PRISMA flow chart"
            >
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#0f172a" />
                </marker>
              </defs>

              <rect x={12} y={12} width={1036} height={60} rx={16} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
              <text x={32} y={42} fontSize="18" fontWeight="700" fill="#0f172a">
                PRISMA 2020 • SPAR - 4 - SLR
              </text>
              <text x={32} y={60} fontSize="12" fill="#64748b">
                Ringkasan seleksi artikel dengan tahap identifikasi, penyaringan, pengambilan, evaluasi, dan inklusi.
              </text>

              {sectionLabels.map((section) => (
                <g key={section.title}>
                  <rect x={section.x} y={section.y} width={section.width} height={section.height} rx={16} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1.5} />
                  <text x={section.x + section.width / 2} y={section.y + section.height / 2} fontSize="12" fontWeight="700" fill="#1e293b" textAnchor="middle" dominantBaseline="middle">
                    {section.title}
                  </text>
                </g>
              ))}

              {mainBoxes.map((box) => (
                <g key={box.title}>
                  <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={16} fill={box.fill} stroke={box.stroke} strokeWidth={2} />
                  <text x={box.x + 20} y={box.y + 36} fontSize="14" fontWeight="700" fill="#0f172a">
                    {box.title}
                  </text>
                  <text x={box.x + 20} y={box.y + box.height - 24} fontSize="14" fontWeight="700" fill={box.stroke}>
                    {box.subtitle(filteredArticles)}
                  </text>
                </g>
              ))}

              {sideBoxes.map((box) => (
                <g key={box.title}>
                  <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={16} fill={box.fill} stroke={box.stroke} strokeWidth={2} />
                  <text x={box.x + 20} y={box.y + 36} fontSize="14" fontWeight="700" fill="#991b1b">
                    {box.title}
                  </text>
                  <text x={box.x + 20} y={box.y + box.height - 24} fontSize="14" fontWeight="700" fill="#991b1b">
                    {box.subtitle(filteredArticles)}
                  </text>
                </g>
              ))}

              {[246, 376, 506].map((py) => (
                <path key={py} d={`M530 ${py} L558 ${py}`} stroke="#334155" strokeWidth={2} markerEnd="url(#arrow)" />
              ))}

              {[190, 320, 450, 575].map((py) => (
                <path key={py} d={`M354 ${py} L354 ${py + 20}`} stroke="#64748b" strokeWidth={2} markerEnd="url(#arrow)" />
              ))}

              <rect x={152} y={700} width={756} height={18} rx={9} fill="#e2e8f0" />
              <text x={diagramWidth / 2} y={714} fontSize="11" fill="#475569" textAnchor="middle">
                Jumlah pada setiap tahapan akan diperbarui secara otomatis mengikuti perubahan data pada tahap sebelumnya.
              </text>
            </svg>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
