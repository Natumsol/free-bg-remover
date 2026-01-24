import React from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../stores/AppStore';

export const Sidebar: React.FC = observer(() => {
    return (
        <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-sidebar-light dark:bg-sidebar-dark transition-colors duration-300">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-glow">
                        <span className="material-symbols-outlined text-[24px]">layers</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            AI Remover
                        </h1>
                        <p className="text-xs font-medium text-slate-400">Pro v2.1</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-1">
                    <div className="px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Menu
                        </p>
                    </div>

                    {/* Home */}
                    <button
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${appStore.viewMode === 'home'
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => appStore.setViewMode('home')}
                    >
                        <span className="material-symbols-outlined text-[20px] font-medium">home</span>
                        <span className="text-sm font-medium">Home</span>
                    </button>

                    <button
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => appStore.selectAndProcessFiles()}
                        disabled={!appStore.modelInitialized || appStore.processing}
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
                            stack
                        </span>
                        <span className="text-sm font-medium">Batch Process</span>
                    </button>

                    <button
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${appStore.viewMode === 'history'
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => appStore.setViewMode('history')}
                        disabled={!appStore.hasProcessedImages}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${appStore.viewMode === 'history'
                            ? ''
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                            }`}>
                            history
                        </span>
                        <span className="text-sm font-medium">History ({appStore.processedImages.length})</span>
                    </button>
                </div>
            </nav>

            {/* Status Footer */}
            <div className="mt-auto border-t border-slate-200 dark:border-slate-800 p-4">
                <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${appStore.modelInitialized
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30'
                    }`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${appStore.modelInitialized
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            }`}>
                            <span className="material-symbols-outlined text-[16px] fill-current">shield</span>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${appStore.modelInitialized
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                                }`}>
                                Local Mode
                            </span>
                            <span className={`text-xs font-semibold ${appStore.modelInitialized
                                ? 'text-emerald-900 dark:text-emerald-200'
                                : 'text-yellow-900 dark:text-yellow-200'
                                }`}>
                                {appStore.modelInitialized ? 'Active' : 'Loading...'}
                            </span>
                        </div>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${appStore.modelInitialized
                        ? 'animate-pulse bg-emerald-500'
                        : 'animate-spin bg-yellow-500'
                        }`}></div>
                </div>
            </div>
        </aside>
    );
});
