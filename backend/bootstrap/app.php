<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->alias([
            'admin'  => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);

        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function ($request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        
        $exceptions->render(function (\App\Exceptions\OrderException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        });

        $exceptions->render(function (\App\Exceptions\DownloadException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 400);
            }
        });

        $exceptions->render(function (\App\Exceptions\UnauthorizedOrderActionException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 403);
            }
        });

       $exceptions->render(function (\App\Exceptions\OrderException $e, $request) {
    if ($request->is('api/*') || $request->expectsJson()) {
        return response()->json(['message' => $e->getMessage()], 400); 
    }
});
    })->create();