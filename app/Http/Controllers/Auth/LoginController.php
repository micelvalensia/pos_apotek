<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController
{
    public function admin(Request $request)
    {
        return $this->login($request, 'admin');
    }

    public function cashier(Request $request)
    {
        return $this->login($request, 'cashier');
    }

    private function login(Request $request, string $role)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        if (Auth::user()->role->name !== $role) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Akun tidak memiliki akses sebagai '.$role.'.',
            ]);
        }

        return redirect()->intended('/dashboard');
    }
}
