<?php

use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\InstrumentalController as AdminInstrumentalController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\PackController as AdminPackController;
use App\Http\Controllers\Api\Admin\ProducerRequestController as AdminProducerRequestController;
use App\Http\Controllers\Api\Admin\PromoCodeController as AdminPromoCodeController;
use App\Http\Controllers\Api\Admin\PromotionController as AdminPromotionController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClassificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\InstrumentalController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PackController;
use App\Http\Controllers\Api\PlaylistController;
use App\Http\Controllers\Api\ProducerController;
use App\Http\Controllers\Api\ProducerInstrumentalController;
use App\Http\Controllers\Api\ProducerRequestController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\PushController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/google/exchange', [GoogleAuthController::class, 'exchangeCode']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,60');
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password',  [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
});

Route::get('/instrumentals',              [InstrumentalController::class, 'index']);
Route::get('/instrumentals/{id}',         [InstrumentalController::class, 'show']);
Route::get('/instrumentals/{id}/preview', [InstrumentalController::class, 'preview']);
Route::get('/instrumentals/{id}/reviews', [ReviewController::class, 'index']);

Route::get('/producers/{id}/followers-count', function (int $id) {
    $producer = \App\Models\Producer::findOrFail($id);
    return response()->json(['count' => $producer->followers()->count()]);
});
Route::get('/producers', [ProducerController::class, 'index']);
Route::get('/producers/{id}', [ProducerController::class, 'show']);
Route::get('/packs',      [PackController::class, 'index']);
Route::get('/packs/{id}', [PackController::class, 'show']);
Route::get('/genres',  [ClassificationController::class, 'genres']);
Route::get('/moods',   [ClassificationController::class, 'moods']);
Route::get('/rhythms', [ClassificationController::class, 'rhythms']);
Route::get('/tags',    [ClassificationController::class, 'tags']);
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,60');
Route::get('/files/{path}', [FileController::class, 'serve'])->where('path', '.*');
Route::get('/stats', [\App\Http\Controllers\Api\StatsController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Routes utilisateur connecté
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::get('/orders',              [OrderController::class, 'index']);
    Route::post('/orders',             [OrderController::class, 'store']);
    Route::get('/orders/{id}',         [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    Route::get('/downloads/{orderId}/{fileType}', [DownloadController::class, 'download'])
        ->where('fileType', 'mp3|wav');

    Route::get('/favorites',            [FavoriteController::class, 'index']);
    Route::post('/favorites/{id}',      [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}',    [FavoriteController::class, 'destroy']);
    Route::get('/favorites/{id}/check', [FavoriteController::class, 'check']);

    Route::post('/instrumentals/{id}/reviews',   [ReviewController::class, 'store']);
    Route::delete('/instrumentals/{id}/reviews', [ReviewController::class, 'destroy']);
    Route::get('/instrumentals/{id}/my-review',  [ReviewController::class, 'myReview']);

    Route::get('/following',                        [FollowController::class, 'index']);
    Route::post('/producers/{id}/follow',           [FollowController::class, 'store']);
    Route::delete('/producers/{id}/follow',         [FollowController::class, 'destroy']);
    Route::get('/producers/{id}/is-following',      [FollowController::class, 'check']);

    Route::get('/playlists',                                 [PlaylistController::class, 'index']);
    Route::post('/playlists',                                [PlaylistController::class, 'store']);
    Route::get('/playlists/{id}',                            [PlaylistController::class, 'show']);
    Route::put('/playlists/{id}',                            [PlaylistController::class, 'update']);
    Route::delete('/playlists/{id}',                         [PlaylistController::class, 'destroy']);
    Route::post('/playlists/{id}/add',                       [PlaylistController::class, 'addInstrumental']);
    Route::delete('/playlists/{id}/remove/{instrumentalId}', [PlaylistController::class, 'removeInstrumental']);

    Route::post('/promo-codes/validate', [PromoCodeController::class, 'validate']);

    Route::post('/producer/request', [ProducerRequestController::class, 'store']);
    Route::get('/producer/request',  [ProducerRequestController::class, 'show']);

    Route::post('/producer/instrumentals', [ProducerInstrumentalController::class, 'store']);
    Route::get('/producer/instrumentals',  [ProducerInstrumentalController::class, 'index']);

    Route::post('/push/subscribe',   [PushController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe']);
});

/*
|--------------------------------------------------------------------------
| Routes administrateur
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'active', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    Route::get('/orders',                [AdminOrderController::class, 'index']);
    Route::post('/orders/{id}/validate', [AdminOrderController::class, 'validate']);
    Route::post('/orders/{id}/reject',   [AdminOrderController::class, 'reject']);

    Route::get('/producer-requests',               [AdminProducerRequestController::class, 'index']);
    Route::post('/producer-requests/{id}/approve', [AdminProducerRequestController::class, 'approve']);
    Route::post('/producer-requests/{id}/reject',  [AdminProducerRequestController::class, 'reject']);

    Route::get('/instrumentals',                [AdminInstrumentalController::class, 'index']);
    Route::post('/instrumentals',               [AdminInstrumentalController::class, 'store']); // ← NOUVEAU
    Route::post('/instrumentals/{id}/validate', [AdminInstrumentalController::class, 'validateInstrumental']);
    Route::post('/instrumentals/{id}/reject',   [AdminInstrumentalController::class, 'reject']);
    Route::get('/instrumentals/{id}/preview-audio/{fileType}', [AdminInstrumentalController::class, 'previewAudio'])
        ->where('fileType', 'mp3|wav');

    Route::get('/catalogue',                     [AdminInstrumentalController::class, 'all']);
    Route::put('/instrumentals/{id}',            [AdminInstrumentalController::class, 'update']);
    Route::post('/instrumentals/{id}/unpublish', [AdminInstrumentalController::class, 'unpublish']);
    Route::delete('/instrumentals/{id}',         [AdminInstrumentalController::class, 'destroy']);

    Route::get('/users',                     [AdminUserController::class, 'index']);
    Route::post('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

    Route::get('/promo-codes',         [AdminPromoCodeController::class, 'index']);
    Route::post('/promo-codes',        [AdminPromoCodeController::class, 'store']);
    Route::delete('/promo-codes/{id}', [AdminPromoCodeController::class, 'destroy']);

    Route::get('/packs',         [AdminPackController::class, 'index']);
    Route::post('/packs',        [AdminPackController::class, 'store']);
    Route::delete('/packs/{id}', [AdminPackController::class, 'destroy']);

    Route::get('/promotions',         [AdminPromotionController::class, 'index']);
    Route::post('/promotions',        [AdminPromotionController::class, 'store']);
    Route::delete('/promotions/{id}', [AdminPromotionController::class, 'destroy']);

    Route::get('/reviews',              [AdminReviewController::class, 'index']);
    Route::post('/reviews/{id}/toggle', [AdminReviewController::class, 'toggleVisibility']);
    Route::delete('/reviews/{id}',      [AdminReviewController::class, 'destroy']);

    // Audit : lecture seule uniquement
    Route::get('/audit-logs',         [AdminAuditLogController::class, 'index']);
    Route::get('/audit-logs/actions', [AdminAuditLogController::class, 'actions']);
    Route::get('/sessions',           [AdminAuditLogController::class, 'sessions']);

    Route::post('/push/send', [PushController::class, 'send']);
});