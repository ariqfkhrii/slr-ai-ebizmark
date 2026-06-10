<?php

namespace App\Console\Commands;

use App\Models\TempPreviewCache;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('app:clean-temp-preview-cache')]
#[Description('Clean up orphaned records in temp_preview_caches table older than 24 hours')]
class CleanTempPreviewCache extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $threshold = now()->subHours(24);

        $deletedCount = TempPreviewCache::where('created_at', '<', $threshold)->delete();

        if ($deletedCount > 0) {
            $message = "Successfully deleted {$deletedCount} orphaned record(s) from temp_preview_caches.";
            $this->info($message);
            Log::info("[Cron Clean Temp] " . $message);
        } else {
            $this->info('No orphaned records found to clean up.');
        }
    }
}
