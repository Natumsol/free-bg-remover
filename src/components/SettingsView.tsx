import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { appStore } from '../stores/AppStore';

export const SettingsView: React.FC = observer(() => {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: 'en' | 'zh') => {
        appStore.setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
        appStore.setTheme(theme);
    };

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'zh', name: 'Chinese', nativeName: '简体中文' }
    ];

    const themes = [
        { value: 'light', icon: 'light_mode', label: t('settings.themeLight') },
        { value: 'dark', icon: 'dark_mode', label: t('settings.themeDark') },
        { value: 'auto', icon: 'brightness_auto', label: t('settings.themeAuto') }
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex-shrink-0 px-8 py-6 bg-[#f5f5f8] dark:bg-[#0f0f23] z-10">
                <div className="flex flex-col gap-1 max-w-4xl mx-auto w-full">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {t('settings.title')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('settings.appearance')}
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    {/* Language Section */}
                    <div className="bg-white dark:bg-[#1e1e38] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[24px]">language</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('settings.language')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('settings.selectLanguage')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code as 'en' | 'zh')}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${appStore.language === lang.code
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {lang.nativeName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {lang.name}
                                        </p>
                                    </div>
                                    {appStore.language === lang.code && (
                                        <span className="material-symbols-outlined text-primary text-[24px]">
                                            check_circle
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div className="bg-white dark:bg-[#1e1e38] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[24px]">palette</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('settings.theme')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('settings.selectTheme')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {themes.map((theme) => (
                                <button
                                    key={theme.value}
                                    onClick={() => handleThemeChange(theme.value as 'light' | 'dark' | 'auto')}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${appStore.theme === theme.value
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`size-12 rounded-full flex items-center justify-center ${appStore.theme === theme.value
                                        ? 'bg-primary/10'
                                        : 'bg-slate-100 dark:bg-slate-800'
                                        }`}>
                                        <span className={`material-symbols-outlined text-[28px] ${appStore.theme === theme.value
                                            ? 'text-primary'
                                            : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {theme.icon}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {theme.label}
                                    </p>
                                    {appStore.theme === theme.value && (
                                        <span className="material-symbols-outlined text-primary text-[20px]">
                                            check_circle
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Info Section */}
                    <div className="bg-white dark:bg-[#1e1e38] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[24px]">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('settings.modelInfo')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    AI Model Status
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                        label
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('settings.modelName')}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    briaai/RMBG-1.4
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                        info
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('settings.modelStatus')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {appStore.modelInitialized ? (
                                        <>
                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {t('settings.modelReady')}
                                            </span>
                                        </>
                                    ) : appStore.modelLoading ? (
                                        <>
                                            <span className="size-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                                {t('settings.modelLoading')}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="size-2 rounded-full bg-red-500"></span>
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                {t('settings.modelError')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                        shield
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('status.localMode')}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {t('status.active')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white dark:bg-[#1e1e38] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[24px]">auto_fix_high</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('settings.about')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('app.name')} - {t('app.subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <p>
                                <span className="font-medium">{t('settings.version')}:</span> 1.0.0
                            </p>
                            <p className="leading-relaxed">
                                {t('status.dataSecure')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
