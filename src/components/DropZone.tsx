import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { appStore } from '../stores/AppStore';

export const DropZone: React.FC = observer(() => {
    const { t } = useTranslation();
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        appStore.setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imagePaths = files
            .filter(file => file.path && /\.(jpg|jpeg|png|webp)$/i.test(file.name))
            .map(file => file.path!);

        if (imagePaths.length > 0) {
            await appStore.processFiles(imagePaths);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        appStore.setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        appStore.setDragOver(false);
    }, []);

    const handleClick = useCallback(() => {
        appStore.selectAndProcessFiles();
    }, []);

    return (
        <div className="flex h-full flex-col px-8 pb-8 md:px-12 lg:px-20 max-w-[1200px] mx-auto w-full">
            {/* Page Heading */}
            <div className="mb-8 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        {t('home.title')}
                    </h2>
                </div>
                <p className="text-base font-normal text-slate-500 dark:text-slate-400 max-w-2xl">
                    {t('home.subtitle')}
                </p>
            </div>

            {/* Main Drop Zone Area */}
            <div
                className={`relative flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-dashed bg-white dark:bg-[#151530] shadow-soft transition-all duration-300 group ${appStore.isDragOver
                    ? 'border-primary shadow-lg scale-[1.02]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 drag-pattern"></div>

                {/* Privacy Badge (Top Right) */}
                <div className="absolute right-4 top-4 z-10">
                    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-slate-400">
                            lock
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {t('home.offlinePrivate')}
                        </span>
                    </div>
                </div>

                {/* Drop Content */}
                <div className="z-0 flex h-full flex-col items-center justify-center p-8 text-center">
                    {/* Illustration Area */}
                    <div className="mb-8 relative">
                        {/* Glowing background effect */}
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[64px] text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors duration-300">
                                image
                            </span>
                            {/* Floating indicator */}
                            <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-md">
                                <span className="material-symbols-outlined text-primary text-[20px]">
                                    auto_fix_high
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Text */}
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                        {appStore.processing ? t('home.processing') : t('home.subtitle')}
                    </h3>
                    <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
                        {appStore.processing
                            ? `${Math.round(appStore.progress)}%`
                            : 'JPG, PNG, WEBP'
                        }
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={handleClick}
                        disabled={!appStore.modelInitialized || appStore.processing}
                        className="relative overflow-hidden rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-blue-700 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                            {appStore.processing ? t('home.processing') : t('home.selectFiles')}
                        </span>
                    </button>

                    {/* Model Error */}
                    {appStore.modelError && (
                        <div className="mt-4 text-sm text-red-500">
                            {appStore.modelError}
                        </div>
                    )}
                </div>

                {/* Drag Overlay */}
                {appStore.isDragOver && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/5">
                        <div className="text-primary text-2xl font-bold">{t('home.dragActive')}</div>
                    </div>
                )}
            </div>

            {/* Footer / Meta Info */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">speed</span>
                    <span>{t('home.processingSpeed')}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">hd</span>
                    <span>{t('home.highQuality')}</span>
                </div>
            </div>
        </div>
    );
});
