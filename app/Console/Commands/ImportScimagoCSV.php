<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use SplFileObject;

class ImportScimagoCSV extends Command
{
    protected $signature = 'scimago:import
        {path : Path ke file scimagojr CSV (delimiter ;)}
        {--truncate : Kosongkan tabel sebelum import}
        {--chunk=500 : Jumlah baris per batch upsert}';

    protected $description = 'Import data Scimago Journal dari file CSV ke tabel scimago_journals.';

    public function handle(): int
    {
        $path = $this->argument('path');
        $chunkSize = (int) $this->option('chunk');

        if (! is_file($path)) {
            $this->error("File tidak ditemukan: {$path}");
            return self::FAILURE;
        }

        if ($this->option('truncate')) {
            DB::table('scimago_journals')->truncate();
        }

        $file = new SplFileObject($path);
        $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY);
        $file->setCsvControl(';', '"', '\\');

        $headers = $file->fgetcsv();
        if (! is_array($headers) || count($headers) === 0) {
            $this->error('Header CSV tidak valid.');
            return self::FAILURE;
        }

        $headerMap = $this->buildHeaderMap($headers);
        $batch = [];
        $count = 0;

        while (! $file->eof()) {
            $row = $file->fgetcsv();
            if (! is_array($row) || count($row) === 1 && $row[0] === null) {
                continue;
            }

            $data = $this->mapRow($row, $headerMap);
            if ($data === null) {
                continue;
            }

            $batch[] = $data;

            if (count($batch) >= $chunkSize) {
                $count += $this->upsertBatch($batch);
                $batch = [];
            }
        }

        if (! empty($batch)) {
            $count += $this->upsertBatch($batch);
        }

        $this->info("Import selesai. Total baris diproses: {$count}");

        return self::SUCCESS;
    }

    private function buildHeaderMap(array $headers): array
    {
        $map = [];
        foreach ($headers as $index => $header) {
            $normalized = trim($header);
            if ($normalized === '' || array_key_exists($normalized, $map)) {
                continue;
            }

            $map[$normalized] = $index;
        }

        return $map;
    }

    private function mapRow(array $row, array $headerMap): ?array
    {
        $sourceId = $this->getValue($row, $headerMap, 'Sourceid');
        $title = $this->getValue($row, $headerMap, 'Title');

        if ($sourceId === null || $title === null) {
            return null;
        }

        $issnRaw = $this->getValue($row, $headerMap, 'Issn');
        [$issnPrint, $issnE] = $this->splitIssn($issnRaw);

        return [
            'source_id' => $sourceId,
            'title' => $title,
            'issn_print' => $issnPrint,
            'issn_e' => $issnE,
            'best_quartile' => $this->getValue($row, $headerMap, 'SJR Best Quartile'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function getValue(array $row, array $headerMap, string $key): ?string
    {
        if (! array_key_exists($key, $headerMap)) {
            return null;
        }

        $value = $row[$headerMap[$key]] ?? null;
        if ($value === null) {
            return null;
        }

        $value = trim($value);
        return $value === '' ? null : $value;
    }

    private function splitIssn(?string $issnRaw): array
    {
        if ($issnRaw === null) {
            return [null, null];
        }

        $parts = array_map('trim', explode(',', $issnRaw));
        $issnPrint = $this->normalizeIssn($parts[0] ?? null);
        $issnE = $this->normalizeIssn($parts[1] ?? null);

        return [$issnPrint, $issnE];
    }

    private function normalizeIssn(?string $issn): ?string
    {
        if ($issn === null) {
            return null;
        }

        $clean = preg_replace('/[^0-9Xx]/', '', $issn);
        $clean = strtoupper($clean ?? '');

        return $clean === '' ? null : $clean;
    }

    private function upsertBatch(array $batch): int
    {
        if (empty($batch)) {
            return 0;
        }

        $updateColumns = [
            'title',
            'issn_print',
            'issn_e',
            'best_quartile',
            'updated_at',
        ];

        DB::table('scimago_journals')->upsert($batch, ['source_id'], $updateColumns);

        return count($batch);
    }
}
