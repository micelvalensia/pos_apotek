import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
    value: string | number;
    label: string;
    sublabel?: string;
    disabled?: boolean;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value?: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    error?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi...',
    searchPlaceholder = 'Ketik untuk mencari...',
    emptyMessage = 'Tidak ada hasil yang cocok.',
    disabled = false,
    className,
    id,
    error = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Selected option lookup
    const selectedOption = React.useMemo(() => {
        if (value === undefined || value === null || value === '') return null;
        return options.find((opt) => String(opt.value) === String(value)) || null;
    }, [options, value]);

    // Filtered options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase().trim();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
        );
    }, [options, search]);

    // Click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when opening
    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearch('');
        }
    }, [isOpen]);

    const handleSelect = (val: string | number) => {
        onChange(String(val));
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {/* Trigger Button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200',
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-neutral-700',
                    isOpen && 'border-primary ring-1 ring-primary'
                )}
            >
                <div className="flex items-center gap-2 truncate text-left">
                    {selectedOption ? (
                        <div className="truncate">
                            <span className="font-medium">{selectedOption.label}</span>
                            {selectedOption.sublabel && (
                                <span className="ml-1.5 text-[11px] text-slate-400 dark:text-neutral-500">
                                    ({selectedOption.sublabel})
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 dark:text-neutral-500 truncate">
                            {placeholder}
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-primary'
                    )}
                />
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Search Input */}
                    <div className="relative mb-1 flex items-center">
                        <Search className="absolute left-2.5 size-3.5 text-slate-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-md bg-slate-50 pl-8 pr-7 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-primary dark:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-900"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 py-0.5">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected =
                                    String(option.value) === String(value);

                                return (
                                    <button
                                        key={String(option.value)}
                                        type="button"
                                        disabled={option.disabled}
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors cursor-pointer',
                                            isSelected
                                                ? 'bg-teal-50 text-primary font-semibold dark:bg-teal-950/50 dark:text-teal-300'
                                                : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                                            option.disabled &&
                                                'cursor-not-allowed opacity-50'
                                        )}
                                    >
                                        <div className="truncate pr-2">
                                            <p className="truncate">{option.label}</p>
                                            {option.sublabel && (
                                                <p className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                                                    {option.sublabel}
                                                </p>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="size-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-4 text-center text-xs text-slate-400 dark:text-neutral-500">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
