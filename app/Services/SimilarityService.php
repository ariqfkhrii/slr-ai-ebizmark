<?php

namespace App\Services;

class SimilarityService
{
    /**
     * Calculate the cosine similarity between two vectors.
     *
     * @param array $vec1
     * @param array $vec2
     * @return float
     */
    public function calculateCosine(array $vec1, array $vec2): float
    {
        $dotProduct = 0.0;
        $norm1 = 0.0;
        $norm2 = 0.0;

        foreach ($vec1 as $i => $val1) {
            $val2 = $vec2[$i] ?? 0; 
            
            $dotProduct += $val1 * $val2;
            $norm1 += $val1 * $val1;
            $norm2 += $val2 * $val2;
        }

        if ($norm1 == 0 || $norm2 == 0) return 0.0;

        return $dotProduct / (sqrt($norm1) * sqrt($norm2));
    }
}