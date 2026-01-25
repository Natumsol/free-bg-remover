import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { appStore, BatchQueueItem } from '../stores/AppStore';

interface BatchQueueCardProps {
    item: BatchQueueItem;
}

export const BatchQueueCard: React.FC<BatchQueueCardProps> = observer(({ item }) => {
    const { t } = useTranslation();

    const handleDelete = () => {
        appStore.removeFromBatchQueue(item.id);
    };

    const handleSave = async () => {
        await appStore.saveBatchItem(item.id);
    };

    const getStatusBadge = () => {
        switch (item.status) {
            case 'completed':
                return (
                    <div className="absolute top-2 right-2">
                        <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="absolute top-2 right-2">
                        <div className="size-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (item.status) {
            case 'completed':
                return (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        {t('batch.status.completed')}
                    </p>
                );
            case 'processing':
                return (
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-primary">{Math.round(item.progress)}%</span>
                    </div>
                );
            case 'error':
                return (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-0.5">
                        {t('batch.status.error')}
                    </p>
                );
            case 'waiting':
            default:
                return (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="size-1.5 rounded-full bg-slate-400"></span> {t('batch.status.waiting')}
                    </p>
                );
        }
    };

    const isProcessing = item.status === 'processing';
    const isCompleted = item.status === 'completed';
    const borderClass = isProcessing
        ? 'border-primary/30 dark:border-primary/30 shadow-md shadow-primary/5'
        : 'border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md';

    return (
        <div className={`group relative flex flex-col gap-3 p-3 rounded-2xl bg-white dark:bg-[#1e1e38] border ${borderClass} transition-all ${!isProcessing ? 'hover:-translate-y-1' : ''}`}>
            {/* Image Container */}
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                {/* Thumbnail/Preview */}
                {item.thumbnail && (
                    <div
                        className={`absolute inset-0 bg-cover bg-center ${item.status === 'waiting' ? 'grayscale-[50%]' : isProcessing ? 'opacity-80' : ''}`}
                        style={{
                            backgroundImage: `url(${item.processedData || item.thumbnail})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
                    </div>
                )}

                {/* Hover Actions */}
                {!isProcessing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {isCompleted && (
                            <button
                                onClick={handleSave}
                                className="size-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white text-white hover:text-primary flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="size-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white text-white hover:text-red-500 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                )}

                {/* Status Badge */}
                {getStatusBadge()}

                {/* File Size Badge */}
                {item.fileSize && item.status === 'waiting' && (
                    <div className="absolute top-2 left-2">
                        <div className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                            <p className="text-[10px] font-medium text-white">
                                {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="px-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={item.fileName}>
                    {item.fileName}
                </p>
                {getStatusText()}
                {item.error && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 truncate mt-0.5" title={item.error}>
                        {item.error}
                    </p>
                )}
            </div>
        </div>
    );
});
