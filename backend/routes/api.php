<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\UserSetController;
use App\Http\Controllers\UserPartController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/register", [AuthController::class, "register"]);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user-sets', [UserSetController::class, 'index']);
    Route::post('/user-sets', [UserSetController::class, 'store']);
    Route::delete('/user-sets/{userSet}', [UserSetController::class, 'destroy']);
    Route::post('/user-parts', [UserPartController::class, 'upsert']);
    Route::get('/user-parts/{setNum}', [UserPartController::class, 'forSet']);
    Route::get('/user-sets/{setNum}/missing', [UserPartController::class, 'missingForSet']);
    Route::patch('/user', [UserController::class, 'update']);
    Route::patch('/user/password', [UserController::class, 'updatePassword']);
});
Route::get("/sets/search", [SetController::class, "search"]);
Route::get('/sets/{setNum}', [SetController::class, 'show']);
Route::get('/sets/{setNum}/parts', [SetController::class, 'parts']);
Route::get('/themes/featured', [SetController::class, 'featuredThemes']);
Route::get('/themes', [SetController::class, 'themes']);


Route::get('/test-mail', function() {
    \Illuminate\Support\Facades\Mail::raw('Test', function($m) {
        $m->to('lovrec.timotej@gmail.com')->subject('Test');
    });
    return 'sent';
});

