import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';
import { useTranslation } from 'react-i18next';

export const HistoryView: React.FC = observer(() => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'last7days'>('all');

    useEffect(() => {
        // Load history when component mounts
        appStore.loadHistoryFromDatabase(50, 0);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            await appStore.searchHistoryImages(query);
        } else {
            await appStore.loadHistoryFromDatabase(50, 0);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm(t('history.confirmDelete'))) {
            await appStore.removeProcessedImage(id);
        }
    };

    const handleDownload = async (image: typeof appStore.processedImages[0]) => {
        try {
            const result = await window.electronAPI.saveFile(image.originalName);
            if (!result.canceled && result.filePath) {
                await window.electronAPI.saveImage(image.processedData, result.filePath);
            }
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    const handleEdit = (image: typeof appStore.processedImages[0]) => {
        // Load this image into the result view for editing
        appStore.setViewMode('result');
        // Set the current processed images array to contain only this one
        appStore.processedImages = [image];
        appStore.setCurrentImageIndex(0);
    };

    const handleClearAll = async () => {
        if (confirm(t('history.confirmClearAll'))) {
            await appStore.clearProcessedImages();
        }
    };

    const filteredImages = filter === 'last7days'
        ? appStore.processedImages.filter(img => {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return img.timestamp >= sevenDaysAgo;
        })
        : appStore.processedImages;

    const formatFileSize = (base64: string): string => {
        const bytes = base64.length * 0.75; // Approximate byte size from base64
        if (bytes < 1024) return `${bytes.toFixed(0)} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatTime = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60 * 1000) return t('history.justNow');
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}${t('history.minutesAgo')}`;
        if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}${t('history.hoursAgo')}`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Toolbar */}
            <header className="bg-white dark:bg-sidebar-dark border-b border-slate-200 dark:border-gray-800 px-8 py-5 flex flex-col gap-5 shrink-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('history.title')}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                            {t('history.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative w-64">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-gray-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/20"
                                placeholder={t('history.searchPlaceholder')}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        {/* Clear All Button */}
                        {appStore.processedImages.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="h-10 px-4 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors"
                            >
                                {t('history.clearAll')}
                            </button>
                        )}
                        {/* View Toggle */}
                        <div className="h-10 p-1 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`h-full px-3 rounded-md flex items-center justify-center transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white'
                                        : 'text-slate-600 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`h-full px-3 rounded-md flex items-center justify-center transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white'
                                        : 'text-slate-600 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {t('history.filterAll')}
                    </button>
                    <button
                        onClick={() => setFilter('last7days')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filter === 'last7days'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {t('history.filterLast7Days')}
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredImages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <svg
                                className="w-16 h-16 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            {t('history.empty')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                            {t('history.emptyDescription')}
                        </p>
                        <button
                            onClick={() => appStore.setViewMode('home')}
                            className="mt-6 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium transition-colors"
                        >
                            {t('history.startProcessing')}
                        </button>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                                : 'flex flex-col gap-4'
                        }
                    >
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="group relative flex flex-col rounded-xl bg-white dark:bg-sidebar-dark border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Image Preview */}
                                <div className="relative h-48 w-full bg-checkered overflow-hidden">
                                    <img
                                        src={image.processedData}
                                        alt={image.originalName}
                                        className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleDownload(image)}
                                            className="size-10 rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-lg"
                                            title={t('history.download')}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(image)}
                                            className="size-10 rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-lg"
                                            title={t('history.edit')}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="size-10 rounded-full bg-white text-slate-900 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-lg"
                                            title={t('history.delete')}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {/* Card Info */}
                                <div className="p-4 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <p
                                            className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                                            title={image.originalName}
                                        >
                                            {image.originalName}
                                        </p>
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            PNG
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-gray-400">
                                        {formatTime(image.timestamp)} • {formatFileSize(image.processedData)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
