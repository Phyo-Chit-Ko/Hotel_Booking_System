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
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Every /api/* request should get a JSON error response, regardless
        // of whether the client sent an `Accept: application/json` header —
        // without this, an unauthenticated request without that header hits
        // Laravel's default HTML/redirect-to-login handling (and, since this
        // app has no named 'login' web route, that itself throws a second,
        // unhandled exception). axios (used everywhere on the frontend)
        // already sends the header, but curl/Postman/etc. don't by default.
        $exceptions->shouldRenderJsonWhen(function ($request, \Throwable $e) {
            return $request->is('api/*');
        });

        // Never leak raw SQL/driver error text to the client — log the real
        // exception server-side and return a clean, understandable message.
        $exceptions->render(function (\Illuminate\Database\QueryException $e, $request) {
            if (!$request->is('api/*')) {
                return null;
            }
            report($e);
            return response()->json([
                'message' => 'A database error occurred while processing your request. Please check your input and try again.',
            ], 500);
        });

        // Catch-all for any other unexpected server error on API routes —
        // let Laravel's normal handling stand for validation/HTTP/not-found
        // exceptions (those already produce clean 422/4xx responses).
        $exceptions->render(function (\Throwable $e, $request) {
            if (!$request->is('api/*')) {
                return null;
            }
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return null;
            }
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                return null;
            }
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return null;
            }
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                return null;
            }
            report($e);
            return response()->json([
                'message' => 'Something went wrong on our end. Please try again.',
            ], 500);
        });
    })->create();
