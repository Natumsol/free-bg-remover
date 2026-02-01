const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_DIR = path.join('resources', 'models', 'briaai', 'RMBG-1.4');
const ONNX_DIR = path.join(MODEL_DIR, 'onnx');

const FILES_TO_DOWNLOAD = [
  {
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/config.json',
    path: path.join(MODEL_DIR, 'config.json')
  },
  {
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/preprocessor_config.json',
    path: path.join(MODEL_DIR, 'preprocessor_config.json')
  },
  {
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model_fp16.onnx',
    path: path.join(ONNX_DIR, 'model_fp16.onnx')
  }
];

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${url}...`);
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        file.close();
        fs.unlinkSync(dest);
        let redirectUrl = response.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const originalUrl = new URL(url);
          redirectUrl = new URL(redirectUrl, originalUrl.origin).href;
        }
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Saved to ${dest}`);
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('📂 Creating model directories...');
  ensureDirectoryExistence(path.join(ONNX_DIR, 'dummy.txt'));

  for (const file of FILES_TO_DOWNLOAD) {
    try {
      await downloadFile(file.url, file.path);
    } catch (err) {
      console.error(`❌ Error downloading ${file.url}:`, err.message);
      process.exit(1);
    }
  }

  console.log(`✅ Done! Models are ready in ${MODEL_DIR}`);

  process.exit(0);
}

main();
