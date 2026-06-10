<?php

namespace App\Enums;

enum SourceDatabase: string
{
    case SCOPUS = 'scopus';
    case PUBMED = 'pubmed';
}
