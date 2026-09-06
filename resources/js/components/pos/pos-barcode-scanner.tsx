import * as React from 'react';
import { Barcode, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PosBarcodeScannerProps {
    onScan: (barcode: string) => void;
    placeholder?: string;
    className?: string;
}

export function PosBarcodeScanner({
    onScan,
    placeholder = 'Scan Barcode Obat (Auto-focus)...',
    className,
}: PosBarcodeScannerProps) {
    const [barcode, setBarcode] = React.useState('');
    const [isScanning, setIsScanning] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Keep focus on barcode input for physical scanner
    React.useEffect(() => {
        const focusInput = () => {
            if (
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA' &&
                document.activeElement?.tagName !== 'BUTTON'
            ) {
                inputRef.current?.focus();
            }
        };

        focusInput();
        const interval = setInterval(focusInput, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (barcode.trim()) {
                triggerScan(barcode.trim());
            }
        }
    };

    const triggerScan = (code: string) => {
        setIsScanning(true);
        onScan(code);
        setBarcode('');
        setTimeout(() => setIsScanning(false), 600);
    };

    return (
        <div className={`relative w-full ${className || ''}`}>
            <div className="relative flex items-center">
                <Barcode
                    className={`absolute left-3.5 size-5 transition-colors ${
                        isScanning ? 'text-emerald-500 scale-110' : 'text-slate-400'
                    }`}
                />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`h-11 w-full pl-11 pr-24 text-sm font-mono tracking-wide rounded-xl border-2 transition-all bg-white dark:bg-neutral-900 shadow-sm ${
                        isScanning
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                <div className="absolute right-2.5 flex items-center gap-1.5">
                    {isScanning && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-pulse">
                            <Sparkles className="size-3" />
                            Scanned!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => barcode.trim() && triggerScan(barcode.trim())}
                        className="inline-flex h-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2.5 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                        <Search className="size-3.5 mr-1" />
                        Scan
                    </button>
                </div>
            </div>
        </div>
    );
}
