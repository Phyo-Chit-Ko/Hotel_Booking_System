<?php
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExtraServiceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Api\ReservationGuestController;
use App\Http\Controllers\Api\RestaurantItemController;
use App\Http\Controllers\NightAuditReportController;
use App\Http\Controllers\Api\GoogleController;

Route::middleware('api')->post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

Route::post('/register', [AuthController::class, 'register']);

Route::get('/customer/{id}', [CustomerController::class, 'getCustomer']);

// Readable by the public booking site AND any authenticated staff role
// (receptionists need these to look up rates/availability while building
// reservations, even though they can't manage rooms/room-types themselves).
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::get('/room-types/{id}', [RoomTypeController::class, 'show']);
Route::get('/rooms/available', [RoomController::class, 'available']); // must be BEFORE the next line
Route::get('/rooms/{roomNumber}/active-reservation', [RoomController::class, 'activeReservation']);
Route::get('/rooms/{roomNumber}', [RoomController::class, 'show']);
Route::apiResource('rooms', RoomController::class)->only(['index']);

// Admin/manager: full CRUD on staff user accounts (admin accounts can never
// be deleted, by anyone — enforced inside UserController::destroy).
Route::middleware(['auth:sanctum', 'role:admin,manager'])->group(function () {
    Route::apiResource('users', UserController::class);
});

// Manager-only: creating, editing, and deleting rooms, room types, and
// restaurant menu items. Admin and receptionist can both VIEW this data (see
// the ungated GET routes above) but neither can mutate it — admin is
// intentionally read-only here, matching receptionist's existing restriction.
//
// Night audit reports also live here: GET to view past reports, POST to
// manually trigger the batch job (see NightAuditReportController::runBatch).
Route::middleware(['auth:sanctum', 'role:manager'])->group(function () {
    Route::post('/room-types', [RoomTypeController::class, 'store']);
    Route::patch('/room-types/{id}/toggle-status', [RoomTypeController::class, 'toggleStatus']);
    Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
    Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);

    Route::patch('rooms/{room_number}/toggle-status', [RoomController::class, 'toggleStatus']);
    Route::apiResource('rooms', RoomController::class)->only(['store', 'update', 'destroy']);

    Route::post('/restaurant-items', [RestaurantItemController::class, 'store']);
    Route::put('/restaurant-items/{id}', [RestaurantItemController::class, 'update']);
    Route::patch('/restaurant-items/{id}/toggle-status', [RestaurantItemController::class, 'toggleStatus']);
    Route::delete('/restaurant-items/{id}', [RestaurantItemController::class, 'destroy']);

    Route::get('/night-audit-reports', [NightAuditReportController::class, 'index']);
    Route::post('/night-audit-reports/run-batch', [NightAuditReportController::class, 'runBatch']);
});

// ── Reservations ──────────────────────────────────────────────────────────────
Route::prefix('reservations')->group(function () {
    // Route::post('/walk-in', [ReservationController::class, 'storeWalkIn']);
});
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/bookings/{id}', [BookingController::class, 'show']);

    Route::put('/bookings/{id}', [BookingController::class, 'update']);
});
Route::get('/my-bookings/{user_id}', [BookingController::class, 'myBookings']);

// Secured — was previously unprotected, now requires an authenticated user
Route::middleware('auth:sanctum')->put('/profile/update', [ProfileController::class, 'update']);

Route::get('/guests/search', [GuestController::class, 'search']);
Route::post('/guests', [GuestController::class, 'store']);
Route::patch('/guests/{id}', [GuestController::class, 'update']);
Route::delete('/guests/{id}', [GuestController::class, 'destroy']);
Route::get('/guests', [GuestController::class, 'index']);
Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

Route::get('/payments', [PaymentController::class, 'index']);
Route::post('/payments', [PaymentController::class, 'store']);

Route::get('/reservations/{reservation}/guests', [ReservationGuestController::class, 'index']);
Route::post('/reservations/{reservation}/guests', [ReservationGuestController::class, 'store']);
Route::delete('/reservations/{reservation}/guests/{guest}', [ReservationGuestController::class, 'destroy']);

Route::get('/services', [ExtraServiceController::class, 'index']);
Route::post('/services', [ExtraServiceController::class, 'store']);
Route::put('/services/{id}', [ExtraServiceController::class, 'update']);
Route::delete('/services/{id}', [ExtraServiceController::class, 'destroy']);

Route::get('/reservations/{id}/detail', [ReservationController::class, 'detail']);
Route::get('/reservations/{id}/ledger', [ReservationController::class, 'ledger']);
Route::patch('/reservations/{id}', [ReservationController::class, 'edit']);
Route::post('/reservations/{id}/check-in', [ReservationController::class, 'checkIn']);
Route::patch('/reservations/{id}/check-out', [ReservationController::class, 'checkOut']);
Route::patch('/reservations/{id}/extend', [ReservationController::class, 'extend']);
Route::patch('/reservations/{id}/move-room', [ReservationController::class, 'moveRoom']);

Route::get('/restaurant-items', [RestaurantItemController::class, 'index']);

// Add these to your routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/initiate-registration', [AuthController::class, 'register']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-code', [AuthController::class, 'resendCode']);
});

// Publicly accessible redirects/callbacks
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// Protected user route
Route::middleware('auth:sanctum')->get('/google/user', function (Request $request) {
    return response()->json([
        'success' => true,
        'user' => $request->user()
    ]);
});