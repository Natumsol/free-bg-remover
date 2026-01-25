import { makeAutoObservable } from 'mobx';

export interface ProcessedImage {
    id: number; // Changed from string to number for database compatibility
    originalPath: string;
    originalName: string;
    originalData: string | null; // base64 data URL of original
    processedData: string; // base64 data URL
    timestamp: number;
}

export interface BackgroundConfig {
    type: 'transparent' | 'color' | 'image';
    color?: string;
    imageData?: string;
}

export interface BatchQueueItem {
    id: string;
    filePath: string;
    fileName: string;
    fileSize?: number;
    status: 'waiting' | 'processing' | 'completed' | 'error';
    progress: number;
    thumbnail?: string; // base64 data URL
    processedData?: string; // base64 data URL
    error?: string;
}

export class AppStore {
    // Model state
    modelInitialized = false;
    modelLoading = false;
    modelError: string | null = null;

    // Processing state
    processing = false;
    progress = 0;
    currentImage: string | null = null;

    // Images
    selectedFiles: string[] = [];
    processedImages: ProcessedImage[] = [];
    currentImageIndex = 0;

    // UI state
    isDragOver = false;
    showHistory = false;
    viewMode: 'home' | 'processing' | 'result' | 'history' | 'batch' | 'settings' = 'home';

    // Comparison slider
    sliderPosition = 50; // 0-100

    // Batch processing
    batchQueue: BatchQueueItem[] = [];
    batchProcessing = false;

    // Settings
    language: 'en' | 'zh' = 'en';
    theme: 'light' | 'dark' | 'auto' = 'auto';

    constructor() {
        makeAutoObservable(this);

        // Load settings from localStorage
        this.loadSettings();

        // Apply initial theme
        this.applyTheme();

        // Setup theme listener for auto mode
        this.setupThemeListener();

        // Load history from database
        this.loadHistoryFromDatabase();
    }

    // Model actions
    setModelInitialized(value: boolean) {
        this.modelInitialized = value;
    }

    setModelLoading(value: boolean) {
        this.modelLoading = value;
    }

    setModelError(error: string | null) {
        this.modelError = error;
    }

    // Processing actions
    setProcessing(value: boolean) {
        this.processing = value;
    }

    setProgress(value: number) {
        this.progress = value;
    }

    setCurrentImage(path: string | null) {
        this.currentImage = path;
    }

    // File actions
    setSelectedFiles(files: string[]) {
        this.selectedFiles = files;
    }

    async addProcessedImage(image: Omit<ProcessedImage, 'id'>): Promise<number | null> {
        try {
            const result = await window.electronAPI.addHistory({
                originalPath: image.originalPath,
                originalName: image.originalName,
                originalData: image.originalData,
                processedData: image.processedData,
            });

            if (result.success && result.id) {
                // Also add to local cache
                this.processedImages.unshift({
                    ...image,
                    id: result.id,
                });
                // Keep only last 50 images in cache
                if (this.processedImages.length > 50) {
                    this.processedImages = this.processedImages.slice(0, 50);
                }
                return result.id;
            }
            return null;
        } catch (error) {
            console.error('Failed to add processed image:', error);
            return null;
        }
    }

    async loadHistoryFromDatabase(limit = 50, offset = 0) {
        try {
            const result = await window.electronAPI.getHistory(limit, offset);
            if (result.success && result.records) {
                this.processedImages = result.records;
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    async clearProcessedImages() {
        try {
            const result = await window.electronAPI.clearHistory();
            if (result.success) {
                this.processedImages = [];
            }
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }

    async removeProcessedImage(id: number) {
        try {
            const result = await window.electronAPI.deleteHistory(id);
            if (result.success && result.deleted) {
                this.processedImages = this.processedImages.filter(img => img.id !== id);
            }
        } catch (error) {
            console.error('Failed to remove processed image:', error);
        }
    }

    async searchHistoryImages(query: string) {
        try {
            const result = await window.electronAPI.searchHistory(query);
            if (result.success && result.records) {
                this.processedImages = result.records;
            }
        } catch (error) {
            console.error('Failed to search history:', error);
        }
    }

    setCurrentImageIndex(index: number) {
        this.currentImageIndex = index;
    }

    // UI actions
    setDragOver(value: boolean) {
        this.isDragOver = value;
    }

    setShowHistory(value: boolean) {
        this.showHistory = value;
    }

    setViewMode(mode: 'home' | 'processing' | 'result' | 'history' | 'batch' | 'settings') {
        this.viewMode = mode;
    }

    setSliderPosition(position: number) {
        this.sliderPosition = Math.max(0, Math.min(100, position));
    }

    // Batch actions
    setBatchProcessing(value: boolean) {
        this.batchProcessing = value;
    }

    addToBatchQueue(items: BatchQueueItem[]) {
        this.batchQueue.push(...items);
    }

    removeFromBatchQueue(id: string) {
        this.batchQueue = this.batchQueue.filter(item => item.id !== id);
    }

    updateBatchQueueItem(id: string, updates: Partial<BatchQueueItem>) {
        const item = this.batchQueue.find(item => item.id === id);
        if (item) {
            Object.assign(item, updates);
        }
    }

    clearBatchQueue() {
        this.batchQueue = [];
    }

    clearCompletedBatchItems() {
        this.batchQueue = this.batchQueue.filter(item => item.status !== 'completed');
    }

    // Settings actions
    setLanguage(language: 'en' | 'zh') {
        this.language = language;
        this.saveSettings();
    }

    setTheme(theme: 'light' | 'dark' | 'auto') {
        this.theme = theme;
        this.applyTheme();
        this.saveSettings();
    }

    private loadSettings() {
        try {
            const savedLanguage = localStorage.getItem('app_language');
            const savedTheme = localStorage.getItem('app_theme');

            if (savedLanguage === 'en' || savedLanguage === 'zh') {
                this.language = savedLanguage;
            }

            if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
                this.theme = savedTheme;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    private saveSettings() {
        try {
            localStorage.setItem('app_language', this.language);
            localStorage.setItem('app_theme', this.theme);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    applyTheme() {
        // Check if document is available (browser environment)
        if (typeof document === 'undefined') {
            console.log('⚠️ Document not available, skipping theme application');
            return;
        }

        const root = document.documentElement;

        console.log('🎨 Applying theme:', this.theme);
        console.log('📋 Current classList:', root.classList.toString());

        if (this.theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            console.log('🔄 Auto mode - System prefers dark:', prefersDark);
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } else if (this.theme === 'dark') {
            console.log('🌙 Setting dark mode');
            root.classList.add('dark');
        } else {
            console.log('☀️ Setting light mode');
            root.classList.remove('dark');
        }

        console.log('✅ Theme applied. New classList:', root.classList.toString());
    }

    // Listen to system theme changes when in auto mode
    setupThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (this.theme === 'auto') {
                this.applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }

    // Computed
    get currentProcessedImage() {
        return this.processedImages[this.currentImageIndex] || null;
    }

    get hasProcessedImages() {
        return this.processedImages.length > 0;
    }

    get batchQueueCount() {
        return this.batchQueue.length;
    }

    get batchProcessingCount() {
        return this.batchQueue.filter(item => item.status === 'processing').length;
    }

    get batchCompletedCount() {
        return this.batchQueue.filter(item => item.status === 'completed').length;
    }

    get batchTotalProgress() {
        if (this.batchQueue.length === 0) return 0;
        const total = this.batchQueue.reduce((sum, item) => {
            if (item.status === 'completed') return sum + 100;
            if (item.status === 'processing') return sum + item.progress;
            return sum;
        }, 0);
        return total / this.batchQueue.length;
    }

    // Async actions
    async initializeModel() {
        if (this.modelInitialized || this.modelLoading) return;

        this.setModelLoading(true);
        this.setModelError(null);

        try {
            const result = await window.electronAPI.initModel();
            if (result.success) {
                this.setModelInitialized(true);
            } else {
                this.setModelError(result.error || 'Failed to initialize model');
            }
        } catch (error) {
            this.setModelError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            this.setModelLoading(false);
        }
    }

    async selectAndProcessFiles() {
        const result = await window.electronAPI.selectFiles();
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
            return;
        }

        await this.processFiles(result.filePaths);
    }

    async processFiles(filePaths: string[]) {
        if (!this.modelInitialized) {
            this.setModelError('Model not initialized yet. Please wait...');
            return;
        }

        this.setSelectedFiles(filePaths);
        this.setProcessing(true);
        this.setProgress(0);
        this.setViewMode('processing');

        try {
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                this.setCurrentImage(filePath);

                // Simulate progress during processing
                this.setProgress(((i) / filePaths.length) * 100);

                // Load original image as base64
                const originalResult = await window.electronAPI.readImage(filePath);
                const originalData = originalResult.success ? originalResult.data : undefined;

                const result = await window.electronAPI.processImage(filePath);

                if (result.success && result.data) {
                    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown';
                    await this.addProcessedImage({
                        originalPath: filePath,
                        originalName: fileName,
                        originalData: originalData || null,
                        processedData: result.data,
                        timestamp: Date.now(),
                    });

                    this.setProgress(((i + 1) / filePaths.length) * 100);
                } else {
                    console.error('Failed to process:', filePath, result.error);
                }
            }

            this.setCurrentImageIndex(0);
            this.setViewMode('result');
        } catch (error) {
            console.error('Processing error:', error);
            this.setModelError(error instanceof Error ? error.message : 'Unknown error');
            this.setViewMode('home');
        } finally {
            this.setProcessing(false);
            this.setCurrentImage(null);
        }
    }

    async saveCurrentImage() {
        const current = this.currentProcessedImage;
        if (!current) return;

        const defaultPath = current.originalName.replace(/\.[^.]+$/, '-no-bg.png');
        const result = await window.electronAPI.saveFile(defaultPath);

        if (!result.canceled && result.filePath) {
            // Save transparent PNG
            await window.electronAPI.saveImage(current.processedData, result.filePath);
        }
    }

    async addFilesToBatch() {
        const result = await window.electronAPI.selectFiles();
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
            return;
        }

        const newItems: BatchQueueItem[] = await Promise.all(
            result.filePaths.map(async (filePath, index) => {
                const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown';

                // Load thumbnail
                let thumbnail: string | undefined;
                try {
                    const thumbResult = await window.electronAPI.readImage(filePath);
                    if (thumbResult.success && thumbResult.data) {
                        thumbnail = thumbResult.data;
                    }
                } catch (error) {
                    console.error('Failed to load thumbnail:', error);
                }

                return {
                    id: `${Date.now()}-${index}-${Math.random()}`,
                    filePath,
                    fileName,
                    status: 'waiting' as const,
                    progress: 0,
                    thumbnail,
                };
            })
        );

        this.addToBatchQueue(newItems);
    }

    async processBatchQueue() {
        if (!this.modelInitialized || this.batchProcessing) return;

        const itemsToProcess = this.batchQueue.filter(
            item => item.status === 'waiting' || item.status === 'error'
        );

        if (itemsToProcess.length === 0) return;

        this.setBatchProcessing(true);

        for (const item of itemsToProcess) {
            try {
                // Update status to processing
                this.updateBatchQueueItem(item.id, {
                    status: 'processing',
                    progress: 0,
                    error: undefined,
                });

                // Load original image as base64
                const originalResult = await window.electronAPI.readImage(item.filePath);
                const originalData = (originalResult.success && originalResult.data) ? originalResult.data : null;

                // Process the image
                const result = await window.electronAPI.processImage(item.filePath);

                if (result.success && result.data) {
                    // Update to completed
                    this.updateBatchQueueItem(item.id, {
                        status: 'completed',
                        progress: 100,
                        processedData: result.data,
                    });

                    // Add to history database
                    await this.addProcessedImage({
                        originalPath: item.filePath,
                        originalName: item.fileName,
                        originalData: originalData,
                        processedData: result.data,
                        timestamp: Date.now(),
                    });
                } else {
                    // Update to error
                    this.updateBatchQueueItem(item.id, {
                        status: 'error',
                        progress: 0,
                        error: result.error || 'Processing failed',
                    });
                }
            } catch (error) {
                console.error('Batch processing error:', error);
                this.updateBatchQueueItem(item.id, {
                    status: 'error',
                    progress: 0,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        this.setBatchProcessing(false);
    }

    async saveBatchItem(itemId: string) {
        const item = this.batchQueue.find(i => i.id === itemId);
        if (!item || !item.processedData) return;

        const defaultPath = item.fileName.replace(/\.[^.]+$/, '-no-bg.png');
        const result = await window.electronAPI.saveFile(defaultPath);

        if (!result.canceled && result.filePath) {
            await window.electronAPI.saveImage(item.processedData, result.filePath);
        }
    }
}

export const appStore = new AppStore();
