import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BackgroundEditor } from './BackgroundEditor';

export const ResultView: React.FC = observer(() => {
    const current = appStore.currentProcessedImage;

    if (!current) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-slate-500">No processed image available</p>
            </div>
        );
    }

    const handleNewImage = () => {
        appStore.setViewMode('home');
        appStore.setSliderPosition(50);
    };

    const handleSave = async () => {
        await appStore.saveCurrentImage();
    };

    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {current.originalName}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Drag the slider to compare before and after
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => appStore.setShowBackgroundEditor(!appStore.showBackgroundEditor)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${appStore.showBackgroundEditor
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">palette</span>
                            Edit Background
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Save Image
                        </button>
                        <button
                            onClick={handleNewImage}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                            New Image
                        </button>
                    </div>
                </div>

                {/* Image Comparison Area */}
                <div className="flex-1 p-8 overflow-hidden">
                    <div className="h-full rounded-2xl overflow-hidden shadow-2xl relative">
                        {/* Comparison Slider */}
                        {current.originalData ? (
                            <BeforeAfterSlider
                                beforeImage={current.originalData}
                                afterImage={current.processedData}
                                backgroundColor={appStore.background.type === 'color' ? appStore.background.color : undefined}
                                backgroundImage={appStore.background.type === 'image' ? appStore.background.imageData : undefined}
                                className="absolute inset-0"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-slate-500">Loading original image...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips */}
                <div className="px-8 pb-6 flex items-center justify-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span>Drag the slider to compare</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">palette</span>
                        <span>Click "Edit Background" to customize</span>
                    </div>
                </div>
            </div>

            {/* Background Editor Sidebar */}
            {appStore.showBackgroundEditor && <BackgroundEditor />}
        </div>
    );
});
