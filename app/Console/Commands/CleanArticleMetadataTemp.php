<?php

namespace App\Console\Commands;

use App\Models\ArticleMetadataTemp;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('app:clean-article-metadata-temp')]
#[Description('Clean up orphaned records in article_metadata_temps table older than 24 hours')]
class CleanArticleMetadataTemp extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $threshold = now()->subHours(24);

        $deletedCount = ArticleMetadataTemp::where('created_at', '<', $threshold)->delete();

        if ($deletedCount > 0) {
            $message = "Successfully deleted {$deletedCount} orphaned record(s) from article_metadata_temps.";
            $this->info($message);
            Log::info("[Cron Clean Temp] " . $message);
        } else {
            $this->info('No orphaned records found to clean up.');
        }
    }
}
