import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { ExtractionArticle } from '../types';

type Props = {
  articles: ExtractionArticle[];
  onOpenDetail: (articleId: number) => void;
  onOpenEdit: (articleId: number) => void;
};

export default function ExtractionResultTable({
  articles,
  onOpenDetail,
  onOpenEdit,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return articles;

    return articles.filter((article) =>
      [
        article.title,
        article.authors,
        article.abstract,
        article.introduction,
        article.result,
        article.conclusion,
        article.recommendation,
        article.noveltyGap,
        article.limitation,
        article.futureResearch,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [articles, search]);

  return (
    <div>
      <strong>Extraction Results</strong>
      <div>Artikel retrieved dengan hasil ekstraksi utama.</div>
      <br />
      <TextField
        size="small"
        placeholder="Cari apapun..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <br />
      <br />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={48}>No</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Abstract</TableCell>
            <TableCell>Introduction</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Conclusion</TableCell>
            <TableCell>Recommendation</TableCell>
            <TableCell align="center" width={120}>
              Act
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredArticles.map((article, index) => (
            <TableRow key={article.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {article.title}
                <div>
                  {article.authors}{' '}
                  {article.publishYear ? `(${article.publishYear})` : ''}
                </div>
              </TableCell>
              <TableCell>{article.abstract || 'Not extracted'}</TableCell>
              <TableCell>{article.introduction || 'Not extracted'}</TableCell>
              <TableCell>{article.result || 'Not extracted'}</TableCell>
              <TableCell>{article.conclusion || 'Not extracted'}</TableCell>
              <TableCell>{article.recommendation || 'Not extracted'}</TableCell>
              <TableCell align="center">
                <Button size="small" onClick={() => onOpenDetail(article.id)}>
                  Detail
                </Button>
                <Button size="small" onClick={() => onOpenEdit(article.id)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
