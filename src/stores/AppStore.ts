import { makeAutoObservable } from 'mobx';

export interface ProcessedImage {
    id: string;
    originalPath: string;
    originalName: string;
    originalData?: string; // base64 data URL of original
    processedData: string; // base64 data URL
    timestamp: number;
}

export interface BackgroundConfig {
    type: 'transparent' | 'color' | 'image';
    color?: string;
    imageData?: string;
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
    viewMode: 'home' | 'processing' | 'result' | 'history' = 'home';

    // Comparison slider
    sliderPosition = 50; // 0-100

    // Background editor
    background: BackgroundConfig = { type: 'transparent' };
    showBackgroundEditor = false;

    constructor() {
        makeAutoObservable(this);
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

    addProcessedImage(image: ProcessedImage) {
        this.processedImages.unshift(image); // Add to beginning
        // Keep only last 50 images
        if (this.processedImages.length > 50) {
            this.processedImages = this.processedImages.slice(0, 50);
        }
    }

    clearProcessedImages() {
        this.processedImages = [];
    }

    removeProcessedImage(id: string) {
        this.processedImages = this.processedImages.filter(img => img.id !== id);
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

    setViewMode(mode: 'home' | 'processing' | 'result' | 'history') {
        this.viewMode = mode;
    }

    setSliderPosition(position: number) {
        this.sliderPosition = Math.max(0, Math.min(100, position));
    }

    setBackground(config: BackgroundConfig) {
        this.background = config;
    }

    setShowBackgroundEditor(value: boolean) {
        this.showBackgroundEditor = value;
    }

    // Computed
    get currentProcessedImage() {
        return this.processedImages[this.currentImageIndex] || null;
    }

    get hasProcessedImages() {
        return this.processedImages.length > 0;
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
                    this.addProcessedImage({
                        id: `${Date.now()}-${i}`,
                        originalPath: filePath,
                        originalName: fileName,
                        originalData,
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
            // If background is set, composite the image with background
            if (this.background.type !== 'transparent') {
                // Convert MobX observable to plain object for IPC
                const plainBackground = {
                    type: this.background.type,
                    color: this.background.color,
                    imageData: this.background.imageData
                };

                await window.electronAPI.saveImageWithBackground(
                    current.processedData,
                    plainBackground,
                    result.filePath
                );
            } else {
                // Save transparent PNG as-is
                await window.electronAPI.saveImage(current.processedData, result.filePath);
            }
        }
    }
}

export const appStore = new AppStore();
