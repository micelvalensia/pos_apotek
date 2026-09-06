<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse
            {
                public function toResponse($request)
                {
                    $role = $request->user()->role->name;

                    return redirect()->intended(
                        $role === 'admin'
                            ? '/admin/dashboard'
                            : '/cashier/dashboard'
                    );
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureAuthentication();
    }

    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::with('role')
                ->where('email', $request->email)
                ->first();

            if (
                $user &&
                Hash::check($request->password, $user->password)
            ) {
                if ($user->role->name !== $request->input('role')) {
                    return null;
                }

                return $user;
            }

            return null;
        });
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        // Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
        //     'canResetPassword' => Features::enabled(Features::resetPasswords()),
        //     'status' => $request->session()->get('status'),
        // ]));

        // Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
        //     'email' => $request->email,
        //     'token' => $request->route('token'),
        //     'passwordRules' => Password::defaults()->toPasswordRulesString(),
        // ]));

        // Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
        //     'status' => $request->session()->get('status'),
        // ]));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
