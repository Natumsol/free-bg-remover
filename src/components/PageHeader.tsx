import React from 'react';
import { observer } from 'mobx-react-lite';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = observer(({
    title,
    subtitle,
    icon,
    children
}) => {
    return (
        <header className="flex-shrink-0 px-8 pt-6 pb-6 bg-[#f5f5f8] dark:bg-[#0f0f23]">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-[1400px] mx-auto w-full">
                {/* Page Title Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1e1e38] shadow-sm border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[22px] text-primary">
                                    {icon}
                                </span>
                            </div>
                        )}
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h2>
                    </div>
                    {subtitle && (
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Action Buttons / Additional Content */}
                {children && (
                    <div className="flex flex-wrap items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
});
