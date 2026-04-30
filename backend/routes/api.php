<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\UserSetController;

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
});
Route::get("/sets/search", [SetController::class, "search"]);
Route::get('/sets/{setNum}', [SetController::class, 'show']);
Route::get('/sets/{setNum}/parts', [SetController::class, 'parts']);
