<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create default watchlist for new user
        $this->createDefaultWatchlist($user->id);

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    /**
     * Create default watchlist for new users
     */
    private function createDefaultWatchlist(int $userId): void
    {
        $defaultStocks = [
            ['AAPL', 'Apple Inc.'],
            ['MSFT', 'Microsoft Corporation'],
            ['GOOGL', 'Alphabet Inc.'],
            ['AMZN', 'Amazon.com Inc.'],
            ['META', 'Meta Platforms Inc.'],
        ];
        
        foreach ($defaultStocks as [$symbol, $name]) {
            try {
                // Create or get stock
                $stock = \App\Models\Stock::firstOrCreate(
                    ['symbol' => $symbol],
                    ['name' => $name]
                );
                
                // Add to user's watchlist
                \App\Models\Watchlist::create([
                    'user_id' => $userId,
                    'stock_id' => $stock->id,
                ]);
                
            } catch (\Exception $e) {
                \Log::error("Failed to create default watchlist for user {$userId}: " . $e->getMessage());
            }
        }
    }
}
