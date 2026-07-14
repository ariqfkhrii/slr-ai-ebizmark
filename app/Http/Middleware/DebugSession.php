<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DebugSession
{
    public function handle(Request $request, Closure $next)
    {
        // \Log::info('DEBUG CSRF', [
        //     'url' => $request->url(),
        //     'method' => $request->method(),
        //     'session_id' => session()->getId(),
        //     'csrf_session' => csrf_token(),
        //     'csrf_header' => $request->header('X-CSRF-TOKEN'),
        // ]);

        return $next($request);
    }
}
