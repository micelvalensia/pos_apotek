import { ShieldPlus } from 'lucide-react';
import { useSidebar } from './ui/sidebar';

export default function AppLogo() {
    const { open } = useSidebar();
    return (
        <>
            <div
                className={`bg-primary flex aspect-square items-center justify-center rounded-lg text-white ${open ? 'size-10' : 'size-8'}`}
            >
                <ShieldPlus className={open ? 'size-5' : 'size-4'} />
            </div>
            <div className="ml-1 grid flex-1 text-left leading-tight">
                <span className="text-primary truncate text-sm font-bold">
                    APOS
                </span>
                <span className="text-primary/70 truncate text-xs font-medium">
                    Main Terminal
                </span>
            </div>
        </>
    );
}
