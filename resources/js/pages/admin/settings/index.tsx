import * as React from 'react';
import { Head } from '@inertiajs/react';
import {
    Building2,
    Percent,
    Settings,
} from 'lucide-react';
import { StoreSettingsForm } from '@/components/settings/store-settings-form';
import { TaxSettingsForm } from '@/components/settings/tax-settings-form';
import type { StoreSettings, TaxSettings } from '@/types';

interface SettingsIndexProps {
    store: StoreSettings;
    tax: TaxSettings;
}

export default function SettingsIndex({ store, tax }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = React.useState<'store' | 'tax'>('store');

    return (
        <>
            <Head title="Pengaturan Sistem & Pajak - POS Apotek" />

            <div className="space-y-6">
                {/* Header Title Bar */}
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="size-6 text-primary" />
                        Pengaturan Sistem & Pajak Apotek
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                        Konfigurasi identitas apotek untuk cetak struk kasir dan kebijakan pemungutan pajak pertambahan nilai (PPN).
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('store')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'store'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Building2 className="size-4" />
                        <span>Identitas Apotek & Format Struk</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('tax')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'tax'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Percent className="size-4" />
                        <span>Pengaturan Pajak (PPN)</span>
                    </button>
                </div>

                {/* TAB 1: STORE SETTINGS */}
                {activeTab === 'store' && <StoreSettingsForm store={store} />}

                {/* TAB 2: TAX SETTINGS */}
                {activeTab === 'tax' && <TaxSettingsForm tax={tax} />}
            </div>
        </>
    );
}
