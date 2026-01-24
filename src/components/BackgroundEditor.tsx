import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore, BackgroundConfig } from '../stores/AppStore';

const PRESET_COLORS = [
    '#FFFFFF', '#000000', '#F3F4F6', '#1F2937',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export const BackgroundEditor: React.FC = observer(() => {
    const [customColor, setCustomColor] = useState('#FFFFFF');

    const handleColorSelect = useCallback((color: string) => {
        appStore.setBackground({ type: 'color', color });
    }, []);

    const handleImageUpload = useCallback(async () => {
        const result = await window.electronAPI.selectFiles();
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
            const imagePath = result.filePaths[0];
            // Read image and convert to base64
            const imageResult = await window.electronAPI.readImage(imagePath);
            if (imageResult.success && imageResult.data) {
                appStore.setBackground({ type: 'image', imageData: imageResult.data });
            }
        }
    }, []);

    const handleTransparent = useCallback(() => {
        appStore.setBackground({ type: 'transparent' });
    }, []);

    return (
        <div className="w-80 bg-white dark:bg-sidebar-dark border-l border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Background Editor
                    </h3>
                    <button
                        onClick={() => appStore.setShowBackgroundEditor(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add a background to your image
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Transparent */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Transparent
                    </h4>
                    <button
                        onClick={handleTransparent}
                        className={`w-full h-12 rounded-lg border-2 transition-all ${appStore.background.type === 'transparent'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                        style={{
                            backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                    >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded">
                            No Background
                        </span>
                    </button>
                </div>

                {/* Preset Colors */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Preset Colors
                    </h4>
                    <div className="grid grid-cols-6 gap-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                className={`h-10 rounded-lg border-2 transition-all ${appStore.background.type === 'color' && appStore.background.color === color
                                    ? 'border-primary scale-110'
                                    : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Custom Color */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Custom Color
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="h-12 w-20 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                        />
                        <button
                            onClick={() => handleColorSelect(customColor)}
                            className="flex-1 h-12 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition-colors"
                        >
                            Apply Color
                        </button>
                    </div>
                </div>

                {/* Image Background */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Image Background
                    </h4>
                    <button
                        onClick={handleImageUpload}
                        className="w-full h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[32px] text-slate-400">add_photo_alternate</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Upload Background
                        </span>
                    </button>
                    {appStore.background.type === 'image' && appStore.background.imageData && (
                        <div className="mt-3 relative h-32 rounded-lg overflow-hidden">
                            <img
                                src={appStore.background.imageData}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Current Background</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
