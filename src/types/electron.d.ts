export interface ElectronAPI {
    // Model operations
    initModel: () => Promise<{ success: boolean; message?: string; error?: string }>;
    getModelInfo: () => Promise<{ modelId: string }>;
    onModelReady: (callback: () => void) => () => void;
    onModelError: (callback: (error: string) => void) => () => void;

    // File operations
    selectFiles: (allowMultiple?: boolean) => Promise<{ canceled: boolean; filePaths?: string[] }>;
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

    // History operations
    addHistory: (record: {
        originalPath: string;
        originalName: string;
        originalData: string | null;
        processedData: string;
    }) => Promise<{ success: boolean; id?: number; error?: string }>;
    getHistory: (limit?: number, offset?: number) => Promise<{
        success: boolean;
        records?: Array<{
            id: number;
            originalPath: string;
            originalName: string;
            originalData: string | null;
            processedData: string;
            timestamp: number;
        }>;
        error?: string;
    }>;
    getHistoryById: (id: number) => Promise<{
        success: boolean;
        record?: {
            id: number;
            originalPath: string;
            originalName: string;
            originalData: string | null;
            processedData: string;
            timestamp: number;
        } | null;
        error?: string;
    }>;
    deleteHistory: (id: number) => Promise<{ success: boolean; deleted?: boolean; error?: string }>;
    clearHistory: () => Promise<{ success: boolean; count?: number; error?: string }>;
    getHistoryCount: () => Promise<{ success: boolean; count?: number; error?: string }>;
    searchHistory: (query: string, limit?: number) => Promise<{
        success: boolean;
        records?: Array<{
            id: number;
            originalPath: string;
            originalName: string;
            originalData: string | null;
            processedData: string;
            timestamp: number;
        }>;
        error?: string;
    }>;

    // Settings operations
    readSettings: () => Promise<any>;
    saveSettings: (settings: any) => Promise<{ success: boolean; error?: string }>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
