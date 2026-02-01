import {
    env,
    AutoModel,
    AutoProcessor,
    RawImage,
    PreTrainedModel,
    Processor
} from "@huggingface/transformers";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Configure environment for Node.js
env.allowLocalModels = true;
env.allowRemoteModels = true;

// Use different path for development vs production (packaged)
const isPackaged = process.env.NODE_ENV === 'production' || process.resourcesPath?.includes('.app/Contents/Resources');
env.localModelPath = isPackaged 
    ? path.join(process.resourcesPath, 'models') + '/'
    : './resources/models/';
env.useBrowserCache = false;
env.cacheDir = './.cache';

// Use ONNX backend for Node.js
if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = 4;
    env.backends.onnx.wasm.proxy = true;
}

// Add detailed logging
console.log('Transformers.js environment config (Node.js):', {
    allowLocalModels: env.allowLocalModels,
    allowRemoteModels: env.allowRemoteModels,
    localModelPath: env.localModelPath,
    cacheDir: env.cacheDir
});

// Model configuration
const MODEL_ID = "briaai/RMBG-1.4";

interface ModelState {
    model: PreTrainedModel | null;
    processor: Processor | null;
}

const state: ModelState = {
    model: null,
    processor: null
};

// Initialize the model
export async function initializeModel(): Promise<boolean> {
    try {
        console.log(`Loading model from: ${MODEL_ID}`);
        console.log(`Local model path: ${env.localModelPath}`);

        state.model = await AutoModel.from_pretrained(MODEL_ID, {
            device: "cpu",
            dtype: "fp32",
            progress_callback: (progress: any) => {
                if (progress.progress !== undefined) {
                    console.log(`Loading model: ${Math.round(progress.progress * 100)}% - ${progress.status} - ${progress.file || ''}`);
                }
            }
        });

        state.processor = await AutoProcessor.from_pretrained(MODEL_ID, {
            config: {
                do_normalize: true,
                do_pad: true,
                do_rescale: true,
                do_resize: true,
                image_mean: [0.5, 0.5, 0.5],
                feature_extractor_type: "ImageFeatureExtractor",
                image_std: [0.5, 0.5, 0.5],
                resample: 2,
                rescale_factor: 0.00392156862745098,
                size: { width: 1024, height: 1024 }
            }
        });

        if (!state.model || !state.processor) {
            throw new Error("Failed to initialize model or processor");
        }

        console.log("✅ Model initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing model:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to initialize background removal model");
    }
}

// Get current model info
export function getModelInfo() {
    return {
        modelId: MODEL_ID
    };
}

/**
 * Process a single image and remove its background
 * @param inputPath - Path to the input image file
 * @param outputPath - Path to save the output image (optional)
 * @returns Buffer of the processed PNG image
 */
export async function processImage(inputPath: string, outputPath?: string): Promise<Buffer> {
    if (!state.model || !state.processor) {
        throw new Error("Model not initialized. Call initializeModel() first.");
    }

    try {
        // Read image using RawImage from file path
        const img = await RawImage.read(inputPath);
        console.log(`Processing image: ${path.basename(inputPath)} (${img.width}x${img.height})`);

        // Pre-process image
        const { pixel_values } = await state.processor(img);

        // Predict alpha matte
        const { output } = await state.model({ input: pixel_values });

        // Resize mask back to original size
        const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
            img.width,
            img.height,
        );

        // Convert mask to buffer
        const maskData = mask.data;

        // Read original image with sharp
        const originalBuffer = await fs.readFile(inputPath);
        const imageInfo = await sharp(originalBuffer)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Apply mask to alpha channel
        const outputData = new Uint8Array(imageInfo.data);
        for (let i = 0; i < maskData.length; i++) {
            outputData[i * 4 + 3] = maskData[i]; // Set alpha channel
        }

        // Create output image with transparency
        const outputBuffer = await sharp(Buffer.from(outputData), {
            raw: {
                width: imageInfo.info.width,
                height: imageInfo.info.height,
                channels: 4
            }
        })
            .png()
            .toBuffer();

        // Save to file if output path is provided
        if (outputPath) {
            await fs.writeFile(outputPath, new Uint8Array(outputBuffer));
            console.log(`✅ Saved processed image to: ${outputPath}`);
        }

        return outputBuffer;
    } catch (error) {
        console.error("Error processing image:", error);
        throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Process multiple images in batch
 * @param inputPaths - Array of input image paths
 * @param outputDir - Directory to save output images (optional)
 * @returns Array of output buffers
 */
export async function processImages(
    inputPaths: string[],
    outputDir?: string
): Promise<Buffer[]> {
    console.log(`Processing ${inputPaths.length} images...`);
    const processedBuffers: Buffer[] = [];

    // Create output directory if specified
    if (outputDir) {
        await fs.mkdir(outputDir, { recursive: true });
    }

    for (const inputPath of inputPaths) {
        try {
            const outputPath = outputDir
                ? path.join(outputDir, `${path.parse(inputPath).name}-no-bg.png`)
                : undefined;

            const buffer = await processImage(inputPath, outputPath);
            processedBuffers.push(buffer);
            console.log(`✅ Successfully processed: ${path.basename(inputPath)}`);
        } catch (error) {
            console.error(`❌ Error processing ${path.basename(inputPath)}:`, error);
            // Continue processing other images
        }
    }

    console.log(`✅ Processing complete: ${processedBuffers.length}/${inputPaths.length} successful`);
    return processedBuffers;
}

// Example usage
if (typeof process !== 'undefined' && process.argv[1] && (module as any).filename === process.argv[1]) {
    (async () => {
        try {
            // Initialize model
            await initializeModel();

            // Get input files from command line arguments
            const inputFiles = process.argv.slice(2);

            if (inputFiles.length === 0) {
                console.log('Usage: node process.node.ts <input-image> [input-image2] ...');
                console.log('Example: node process.node.ts input.jpg photo.png');
                process.exit(1);
            }

            // Process images
            await processImages(inputFiles, './output');

            console.log('✅ All done!');
        } catch (error) {
            console.error('❌ Fatal error:', error);
            process.exit(1);
        }
    })();
}
