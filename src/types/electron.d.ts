export interface ElectronAPI {
    // Model operations
    initModel: () => Promise<{ success: boolean; message?: string; error?: string }>;
    getModelInfo: () => Promise<{ modelId: string }>;
    onModelReady: (callback: () => void) => () => void;
    onModelError: (callback: (error: string) => void) => () => void;

    // File operations
    selectFiles: () => Promise<{ canceled: boolean; filePaths?: string[] }>;
    saveFile: (defaultPath: string) => Promise<{ canceled: boolean; filePath?: string }>;
    saveImage: (base64Data: string, outputPath: string) => Promise<{ success: boolean; error?: string }>;
    saveImageWithBackground: (
        base64Data: string,
        background: { type: string; color?: string; imageData?: string },
        outputPath: string
    ) => Promise<{ success: boolean; error?: string }>;
    readImage: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;

    // Image processing
    processImage: (inputPath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    processBatch: (inputPaths: string[]) => Promise<{
        success: boolean;
        results?: Array<{ originalPath: string; data: string }>;
        error?: string
    }>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
