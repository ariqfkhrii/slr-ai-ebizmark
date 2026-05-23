<?php

namespace Tests\Unit;

use App\Services\FilteredArticleDoiService;
use PHPUnit\Framework\TestCase;

class FilteredArticleDoiServiceTest extends TestCase
{
    public function test_it_can_detect_doi_pattern_from_text(): void
    {
        $text = 'This article is available at https://doi.org/10.1016/j.techsoc.2023.102345';

        preg_match_all('/10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/i', $text, $matches);

        $this->assertNotEmpty($matches[0]);
        $this->assertEquals(
            '10.1016/j.techsoc.2023.102345',
            $matches[0][0]
        );
    }

    public function test_it_can_detect_multiple_dois_from_text(): void
    {
        $text = '
            DOI: 10.1109/ACCESS.2022.1234567
            Reference: https://doi.org/10.1016/j.chb.2021.106789
        ';

        preg_match_all('/10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/i', $text, $matches);

        $this->assertCount(2, $matches[0]);
        $this->assertContains('10.1109/ACCESS.2022.1234567', $matches[0]);
        $this->assertContains('10.1016/j.chb.2021.106789', $matches[0]);
    }
}