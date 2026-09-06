import { dashboard } from '@/routes/admin';
import { admin, cashier } from '@/routes/login';
import { dashboard as dashboardCashier } from '@/routes/cashier';
import { usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage().props;

    const roles = [
        {
            key: 'admin',
            label: 'Admin',
            eyebrow: 'Akses Penuh',
            description:
                'Kelola produk, stok, laporan penjualan, dan pengaturan toko dari satu tempat.',
            accent: 'primary',
            icon: (
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
                        d="M12 3l7 3v5c0 4.5-3 8.25-7 9.5-4-1.25-7-5-7-9.5V6l7-3z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.5 12l2 2 3.5-4"
                    />
                </svg>
            ),
        },
        {
            key: 'cashier',
            label: 'Kasir',
            eyebrow: 'Transaksi Harian',
            description:
                'Proses pesanan, terima pembayaran, dan cetak struk dengan cepat di kasir.',
            accent: 'secondary',
            icon: (
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
            ),
        },
    ] as const;

    const accentClasses: Record<
        string,
        { border: string; iconBg: string; iconText: string; text: string }
    > = {
        primary: {
            border: 'hover:border-primary focus-visible:border-primary hover:shadow-primary/10 focus-visible:ring-primary',
            iconBg: 'bg-primary/10 group-hover:bg-primary',
            iconText: 'text-primary group-hover:text-white',
            text: 'text-primary',
        },
        secondary: {
            border: 'hover:border-secondary focus-visible:border-secondary hover:shadow-secondary/10 focus-visible:ring-secondary',
            iconBg: 'bg-secondary/10 group-hover:bg-secondary',
            iconText: 'text-secondary group-hover:text-white',
            text: 'text-secondary',
        },
    };

    return (
        <div className="bg-surface min-h-screen font-sans text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
                {auth?.user && (
                    <a
                        href={
                            auth.user.role?.name === 'admin'
                                ? dashboard().url
                                : dashboardCashier().url
                        }
                        className="text-tertiary mb-8 text-sm underline-offset-4 hover:text-slate-900 hover:underline"
                    >
                        Sudah login sebagai {auth.user.name} — lanjut ke
                        dashboard →
                    </a>
                )}

                <div className="mb-10 text-center sm:mb-14">
                    <p className="text-tertiary mb-3 text-xs font-medium tracking-[0.3em] uppercase">
                        Selamat Datang
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Masuk sebagai apa hari ini?
                    </h1>
                </div>

                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                    {roles.map((role) => {
                        const accent = accentClasses[role.accent];
                        return (
                            <a
                                key={role.key}
                                href={
                                    role.key === 'admin'
                                        ? admin().url
                                        : cashier().url
                                }
                                className={`group border-tertiary/20 focus-visible:ring-offset-surface relative flex flex-col rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-200 outline-none hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-2 ${accent.border}`}
                            >
                                <div
                                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${accent.iconBg} ${accent.iconText}`}
                                >
                                    {role.icon}
                                </div>

                                <span className="text-tertiary mb-1 text-xs font-semibold tracking-wider uppercase">
                                    {role.eyebrow}
                                </span>
                                <h2 className="mb-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                                    Login sebagai {role.label}
                                </h2>
                                <p className="text-tertiary text-sm leading-relaxed">
                                    {role.description}
                                </p>

                                <span
                                    className={`mt-5 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${accent.text}`}
                                >
                                    Masuk sekarang
                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
