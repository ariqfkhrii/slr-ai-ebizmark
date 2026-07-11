<?php

namespace App\Services\Query;

class QueryPreprocessingService
{
    public function clean(string $query): string
    {
        // Hapus TITLE-ABS-KEY(...)
        $query = preg_replace(
            '/TITLE-ABS-KEY/i',
            '',
            $query
        );

        // Hapus bagian AND NOT xxx
        $query = preg_replace(
            '/AND\s+NOT\s+("[^"]+"|\([^)]+\)|\S+)/i',
            '',
            $query
        );

        // Hapus operator boolean
        $query = preg_replace(
            '/\b(AND|OR|NOT)\b/i',
            ' ',
            $query
        );

        // Hapus karakter query
        $query = str_replace(
            ['(', ')', '"'],
            ' ',
            $query
        );

        // Rapikan spasi
        $query = preg_replace('/\s+/', ' ', $query);

        return trim($query);
    }
}