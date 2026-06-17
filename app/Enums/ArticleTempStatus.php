<?php

namespace App\Enums;

enum ArticleTempStatus: string
{
    case ACCEPTED = 'accepted';
    case MISSING_DOI = 'missing_doi';
    case UNMATCHED_TIER = 'unmatched_tier';
}
