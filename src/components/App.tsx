import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Sidebar } from './Sidebar';
import { DropZone } from './DropZone';
import { ProcessingView } from './ProcessingView';
import { ResultView } from './ResultView';
import { ImagePreview } from './ImagePreview';
import { appStore } from '../stores/AppStore';

export const App: React.FC = observer(() => {
    useEffect(() => {
        // Listen for model ready event
        const unsubscribeReady = window.electronAPI.onModelReady(() => {
            console.log('Model ready!');
            appStore.setModelInitialized(true);
            appStore.setModelLoading(false);
        });

        const unsubscribeError = window.electronAPI.onModelError((error) => {
            console.error('Model error:', error);
            appStore.setModelError(error);
            appStore.setModelLoading(false);
        });

        // Check if model is already initialized
        window.electronAPI.getModelInfo().then(() => {
            // Model info available means it's initialized
            appStore.setModelInitialized(true);
        }).catch(() => {
            // Not initialized yet, wait for event
            appStore.setModelLoading(true);
        });

        return () => {
            unsubscribeReady();
            unsubscribeError();
        };
    }, []);

    // Render different views based on viewMode
    const renderMainContent = () => {
        switch (appStore.viewMode) {
            case 'processing':
                return <ProcessingView />;

            case 'result':
                return <ResultView />;

            case 'history':
                return appStore.hasProcessedImages ? <ImagePreview /> : <DropZone />;

            case 'home':
            default:
                return <DropZone />;
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                {/* Window Drag Area (Mac-like feel) */}
                <div
                    className="h-8 w-full shrink-0 select-none"
                    style={{ WebkitAppRegion: 'drag' } as any}
                />

                <div className="flex-1 overflow-hidden">
                    {renderMainContent()}
                </div>
            </main>
        </div>
    );
});
