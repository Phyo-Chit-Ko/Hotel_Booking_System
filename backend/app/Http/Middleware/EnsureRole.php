<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Restrict a route to one or more roles, e.g. `role:admin,manager`.
     * Comparison is case-insensitive so any casing drift in stored/seeded
     * role values (a real, already-seen bug in this app) can't silently
     * lock legitimate users out or let others slip through.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = strtolower((string) $user->role);
        $allowed = array_map('strtolower', $roles);

        if (! in_array($userRole, $allowed, true)) {
            return response()->json(['message' => 'You do not have permission to access this resource.'], 403);
        }

        return $next($request);
    }
}
