import { Form } from '@inertiajs/react';

export default function LoginCashier() {
    return (
        <>
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
                <div className="bg-secondary/10 text-secondary mb-1 flex h-12 w-12 items-center justify-center rounded-xl">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7"
                        stroke="currentColor"
                        strokeWidth="1.75"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 7h18l-1.5 9.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 7z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3h5A2.5 2.5 0 0 1 17 5.5V7"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="2.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="text-tertiary text-xs font-semibold tracking-wider uppercase">
                    Transaksi Harian
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Login Kasir
                </h1>
                <p className="text-tertiary text-sm">
                    Masuk untuk mulai melayani transaksi hari ini.
                </p>
            </div>

            <Form method="post" action="/login" className="space-y-4">
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="role" value="cashier" />

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="nama@perusahaan.com"
                                className={`placeholder:text-tertiary/60 focus:ring-secondary/30 w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors outline-none focus:ring-2 ${
                                    errors.email
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-tertiary/25 focus:border-secondary'
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={`placeholder:text-tertiary/60 focus:ring-secondary/30 w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors outline-none focus:ring-2 ${
                                    errors.password
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-tertiary/25 focus:border-secondary'
                                }`}
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-secondary hover:bg-secondary/90 mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing && (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-4 w-4 animate-spin"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                            )}
                            {processing ? 'Memproses...' : 'Login Kasir'}
                        </button>
                    </>
                )}
            </Form>
        </>
    );
}
