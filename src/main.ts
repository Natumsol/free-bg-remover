import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'fs/promises';
import started from 'electron-squirrel-startup';
import sharp from 'sharp';
import { initializeModel, processImage, processImages, getModelInfo } from './process';
import {
  initDatabase,
  closeDatabase,
  addHistoryRecord,
  getHistoryRecords,
  getHistoryRecordById,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryCount,
  searchHistory
} from './database';

// Vite environment variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let modelInitialized = false;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#f5f5f8',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools in development
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// IPC Handlers
ipcMain.handle('model:init', async () => {
  try {
    if (modelInitialized) {
      return { success: true, message: 'Model already initialized' };
    }

    console.log('Initializing model...');
    await initializeModel();
    modelInitialized = true;

    return { success: true, message: 'Model initialized successfully' };
  } catch (error) {
    console.error('Model initialization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('model:info', async () => {
  return getModelInfo();
});

ipcMain.handle('file:select', async () => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  });

  return result;
});

ipcMain.handle('file:save', async (_, defaultPath: string) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'PNG Image', extensions: ['png'] }
    ]
  });

  return result;
});

ipcMain.handle('file:read-image', async (_, filePath: string) => {
  try {
    const buffer = await fs.readFile(filePath);
    const base64 = buffer.toString('base64');

    // Detect image type
    let mimeType = 'image/png';
    if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (filePath.toLowerCase().endsWith('.webp')) {
      mimeType = 'image/webp';
    }

    return {
      success: true,
      data: `data:${mimeType};base64,${base64}`
    };
  } catch (error) {
    console.error('Read image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('image:process', async (_, inputPath: string) => {
  try {
    if (!modelInitialized) {
      throw new Error('Model not initialized. Please wait for initialization to complete.');
    }

    console.log('Processing image:', inputPath);
    const buffer = await processImage(inputPath);

    // Convert buffer to base64 for sending to renderer
    const base64 = buffer.toString('base64');

    return {
      success: true,
      data: `data:image/png;base64,${base64}`
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('image:process-batch', async (_, inputPaths: string[]) => {
  try {
    if (!modelInitialized) {
      throw new Error('Model not initialized. Please wait for initialization to complete.');
    }

    console.log('Processing batch of', inputPaths.length, 'images');
    const buffers = await processImages(inputPaths);

    // Convert buffers to base64
    const results = buffers.map((buffer, index) => ({
      originalPath: inputPaths[index],
      data: `data:image/png;base64,${buffer.toString('base64')}`
    }));

    return { success: true, results };
  } catch (error) {
    console.error('Batch processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('file:save-image', async (_, base64Data: string, outputPath: string) => {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    await fs.writeFile(outputPath, buffer);

    return { success: true };
  } catch (error) {
    console.error('Save image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('file:save-image-with-background', async (
  _,
  base64Data: string,
  background: { type: string; color?: string; imageData?: string },
  outputPath: string
) => {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64, 'base64');

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    let backgroundBuffer: Buffer;

    if (background.type === 'color' && background.color) {
      // Create solid color background
      const hex = background.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      backgroundBuffer = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r, g, b }
        }
      }).png().toBuffer();

    } else if (background.type === 'image' && background.imageData) {
      // Use image as background
      const bgBase64 = background.imageData.replace(/^data:image\/\w+;base64,/, '');
      const bgBuffer = Buffer.from(bgBase64, 'base64');

      // Resize background to match foreground dimensions
      backgroundBuffer = await sharp(bgBuffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();

    } else {
      // Fallback to white background
      backgroundBuffer = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      }).png().toBuffer();
    }

    // Composite foreground over background
    const outputBuffer = await sharp(backgroundBuffer)
      .composite([{
        input: imageBuffer,
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();

    await fs.writeFile(outputPath, outputBuffer);

    return { success: true };
  } catch (error) {
    console.error('Save image with background error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Database IPC handlers
ipcMain.handle('history:add', async (_, record: Omit<Parameters<typeof addHistoryRecord>[0], 'timestamp'>) => {
  try {
    const id = addHistoryRecord({
      ...record,
      timestamp: Date.now()
    });
    return { success: true, id };
  } catch (error) {
    console.error('Add history record error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:get', async (_, limit?: number, offset?: number) => {
  try {
    const records = getHistoryRecords(limit, offset);
    return { success: true, records };
  } catch (error) {
    console.error('Get history records error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:get-by-id', async (_, id: number) => {
  try {
    const record = getHistoryRecordById(id);
    return { success: true, record };
  } catch (error) {
    console.error('Get history record by id error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:delete', async (_, id: number) => {
  try {
    const deleted = deleteHistoryRecord(id);
    return { success: true, deleted };
  } catch (error) {
    console.error('Delete history record error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:clear', async () => {
  try {
    const count = clearAllHistory();
    return { success: true, count };
  } catch (error) {
    console.error('Clear history error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:count', async () => {
  try {
    const count = getHistoryCount();
    return { success: true, count };
  } catch (error) {
    console.error('Get history count error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('history:search', async (_, query: string, limit?: number) => {
  try {
    const records = searchHistory(query, limit);
    return { success: true, records };
  } catch (error) {
    console.error('Search history error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', async () => {
  // Initialize database
  try {
    initDatabase();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }

  createWindow();

  // Start model initialization in background
  setTimeout(async () => {
    try {
      console.log('Starting background model initialization...');
      await initializeModel();
      modelInitialized = true;

      // Notify renderer that model is ready
      if (mainWindow) {
        mainWindow.webContents.send('model:ready');
      }
      console.log('✅ Model ready');
    } catch (error) {
      console.error('❌ Model initialization failed:', error);
      if (mainWindow) {
        mainWindow.webContents.send('model:error', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, 1000);
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
