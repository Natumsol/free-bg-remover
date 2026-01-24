import React from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';

export const ProcessingView: React.FC = observer(() => {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            {/* Image Preview with Overlay */}
            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xl">
                {/* Original Image */}
                {appStore.currentImage && (
                    <img
                        src={`file://${appStore.currentImage}`}
                        alt="Processing"
                        className="w-full h-full object-contain"
                    />
                )}

                {/* Processing Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    {/* Spinner */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[48px]">
                                auto_fix_high
                            </span>
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Processing Your Image
                        </h3>
                        <p className="text-white/80">
                            AI is removing the background...
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${appStore.progress}%` }}
                            />
                        </div>
                        <div className="mt-3 text-center">
                            <span className="text-white text-sm font-medium">
                                {Math.round(appStore.progress)}%
                            </span>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm">
                            💡 This process is 100% offline and private
                        </p>
                    </div>
                </div>
            </div>

            {/* Processing Info */}
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>100% Local</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span>High Quality</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                    <span>Offline Processing</span>
                </div>
            </div>
        </div>
    );
});
