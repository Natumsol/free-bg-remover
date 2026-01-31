import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { appStore } from '../stores/AppStore';
import { BatchQueueCard } from './BatchQueueCard';
import { PageHeader } from './PageHeader';

export const BatchView: React.FC = observer(() => {
    const { t } = useTranslation();
    const handleAddImages = async () => {
        await appStore.addFilesToBatch();
    };

    const handleProcessAll = async () => {
        await appStore.processBatchQueue();
    };

    const handleClearCompleted = () => {
        appStore.clearCompletedBatchItems();
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Handle dropped files
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const filePaths = files.map(f => f.path);
            // Note: In Electron, file.path gives us the full path
            // We'll need to handle this through the store
            console.log('Dropped files:', filePaths);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const waitingCount = appStore.batchQueue.filter(item => item.status === 'waiting').length;
    const hasItems = appStore.batchQueueCount > 0;
    const canProcess = hasItems && !appStore.batchProcessing && appStore.modelInitialized && waitingCount > 0;

    // Generate subtitle with queue info
    const getSubtitle = () => {
        let subtitle = t('batch.itemsInQueue', { count: appStore.batchQueueCount });
        if (appStore.batchCompletedCount > 0) {
            subtitle += ` • ${t('batch.completed', { count: appStore.batchCompletedCount })}`;
        }
        return subtitle;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Unified Page Header */}
            <PageHeader
                title={t('batch.title')}
                subtitle={getSubtitle()}
                icon="layers"
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                        {/* Clear Completed Button */}
                        {appStore.batchCompletedCount > 0 && (
                            <button
                                onClick={handleClearCompleted}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e1e38] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                {t('batch.clearCompleted')}
                            </button>
                        )}

                        {/* Add Images Button */}
                        <button
                            onClick={handleAddImages}
                            disabled={!appStore.modelInitialized}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1e1e38] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-900 dark:text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                            {t('batch.addImages')}
                        </button>

                        {/* Process All Button */}
                        <button
                            onClick={handleProcessAll}
                            disabled={!canProcess}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {appStore.batchProcessing ? (
                                <>
                                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                    {t('batch.processing')}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                    {t('batch.processAll')}
                                </>
                            )}
                        </button>
                    </div>
            </PageHeader>

            {/* Scrollable Grid Content */}
            <div
                className="flex-1 overflow-y-auto px-8 pb-8"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="max-w-[1400px] mx-auto w-full">
                    {hasItems ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Queue Items */}
                            {appStore.batchQueue.map(item => (
                                <BatchQueueCard key={item.id} item={item} />
                            ))}

                            {/* Upload Placeholder Card */}
                            <div
                                onClick={handleAddImages}
                                className="group relative flex flex-col items-center justify-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all min-h-[240px]"
                            >
                                <div className="size-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[24px]">
                                        add
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-primary text-center px-4">
                                    {t('batch.addMore')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Empty State
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="relative mb-8">
                                <div className="size-24 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[56px]">layers</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 size-8 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border-2 border-[#f5f5f8] dark:border-[#0f0f23]">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">add</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {t('batch.noImages')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">
                                {t('batch.noImagesDesc')}
                            </p>
                            <button
                                onClick={handleAddImages}
                                disabled={!appStore.modelInitialized}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                {t('batch.addToQueue')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status Bar */}
            {appStore.batchProcessing && (
                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13132b] px-8 py-3 z-10">
                    <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-5">
                                <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
                                    progress_activity
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('batch.processingStatus', {
                                    current: appStore.batchProcessingCount,
                                    total: appStore.batchQueueCount
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 w-64">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${appStore.batchTotalProgress}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {Math.round(appStore.batchTotalProgress)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
