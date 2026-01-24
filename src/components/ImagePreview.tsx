import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';

export const ImagePreview: React.FC = observer(() => {
    const [showOriginal, setShowOriginal] = useState(false);

    if (!appStore.hasProcessedImages) {
        return null;
    }

    const current = appStore.currentProcessedImage;
    if (!current) return null;

    const handleSave = async () => {
        await appStore.saveCurrentImage();
    };

    const handlePrevious = () => {
        if (appStore.currentImageIndex < appStore.processedImages.length - 1) {
            appStore.setCurrentImageIndex(appStore.currentImageIndex + 1);
        }
    };

    const handleNext = () => {
        if (appStore.currentImageIndex > 0) {
            appStore.setCurrentImageIndex(appStore.currentImageIndex - 1);
        }
    };

    return (
        <div className="flex h-full flex-col px-8 pb-8 md:px-12 lg:px-20 max-w-[1200px] mx-auto w-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Processed Images
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {current.originalName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevious}
                        disabled={appStore.currentImageIndex >= appStore.processedImages.length - 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        {appStore.currentImageIndex + 1} / {appStore.processedImages.length}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={appStore.currentImageIndex <= 0}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Image Display */}
            <div className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-sidebar-dark overflow-hidden shadow-soft">
                <div className="h-full flex flex-col">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowOriginal(!showOriginal)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showOriginal
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                Show Original
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-blue-700 hover:shadow-primary/50 hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Save Image
                        </button>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 overflow-auto p-8">
                        <div className="relative mx-auto max-w-full max-h-full flex items-center justify-center">
                            {/* Checkerboard background for transparency */}
                            <div
                                className="relative"
                                style={{
                                    backgroundImage: showOriginal ? 'none' : 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }}
                            >
                                <img
                                    src={showOriginal ? `file://${current.originalPath}` : current.processedData}
                                    alt={current.originalName}
                                    className="max-w-full max-h-[calc(100vh-400px)] object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {appStore.processedImages.length > 1 && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Recent Images
                    </h3>
                    <div className="grid grid-cols-6 gap-3">
                        {appStore.processedImages.slice(0, 6).map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => appStore.setCurrentImageIndex(index)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === appStore.currentImageIndex
                                    ? 'border-primary shadow-lg scale-105'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                    }`}
                            >
                                <img
                                    src={img.processedData}
                                    alt={img.originalName}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
