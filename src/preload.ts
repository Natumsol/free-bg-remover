// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Model operations
    initModel: () => ipcRenderer.invoke('model:init'),
    getModelInfo: () => ipcRenderer.invoke('model:info'),
    onModelReady: (callback: () => void) => {
        ipcRenderer.on('model:ready', callback);
        return () => ipcRenderer.removeListener('model:ready', callback);
    },
    onModelError: (callback: (error: string) => void) => {
        const handler = (_event: any, error: string) => callback(error);
        ipcRenderer.on('model:error', handler);
        return () => ipcRenderer.removeListener('model:error', handler);
    },

    // File operations
    selectFiles: () => ipcRenderer.invoke('file:select'),
    saveFile: (defaultPath: string) => ipcRenderer.invoke('file:save', defaultPath),
    saveImage: (base64Data: string, outputPath: string) =>
        ipcRenderer.invoke('file:save-image', base64Data, outputPath),
    saveImageWithBackground: (base64Data: string, background: any, outputPath: string) =>
        ipcRenderer.invoke('file:save-image-with-background', base64Data, background, outputPath),
    readImage: (filePath: string) => ipcRenderer.invoke('file:read-image', filePath),

    // Image processing
    processImage: (inputPath: string) => ipcRenderer.invoke('image:process', inputPath),
    processBatch: (inputPaths: string[]) => ipcRenderer.invoke('image:process-batch', inputPaths),

    // History operations
    addHistory: (record: any) => ipcRenderer.invoke('history:add', record),
    getHistory: (limit?: number, offset?: number) => ipcRenderer.invoke('history:get', limit, offset),
    getHistoryById: (id: number) => ipcRenderer.invoke('history:get-by-id', id),
    deleteHistory: (id: number) => ipcRenderer.invoke('history:delete', id),
    clearHistory: () => ipcRenderer.invoke('history:clear'),
    getHistoryCount: () => ipcRenderer.invoke('history:count'),
    searchHistory: (query: string, limit?: number) => ipcRenderer.invoke('history:search', query, limit),
});
