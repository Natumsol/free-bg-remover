import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// 读取 package.json 获取开发依赖
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const devDependencies = [
  ...Object.keys(packageJson.devDependencies || {}),
  // 额外的需忽略的包（可能是隐式依赖或工具）
  'lightningcss-darwin-arm64',
  'lightningcss',
];

// 生成 ignore 正则表达式列表
const createIgnorePatterns = (): RegExp[] => {
  const patterns: RegExp[] = [
    // 源代码和配置文件
    /^\/src/,
    /^\/scripts/,
    /^\/.cache/,
    /^\/.git/,
    /^\/.gitignore/,
    /^\/.npmrc/,
    /^\/.eslintrc/,
    /^\/README\.md/,
    /^\/FEATURES\.md/,
    /^\/forge\.config\.ts/,
    /^\/forge\.env\.d\.ts/,
    /^\/tsconfig\.json/,
    /^\/postcss\.config\.js/,
    /^\/tailwind\.config/,
    /^\/vite\./,
    /^\/index\.html/,
    /^\/package-lock\.json/,
    
    // 文档和测试文件
    /\/docs\//,
    /\/test\//,
    /\/tests\//,
    /\/__tests__\//,
    /\/\.github\//,
    /\/\.git\//,
    /\/example\//,
    /\/examples\//,
    /\/demo\//,
    /\/benchmark\//,
    /\/\.idea\//,
    /\/\.vscode\//,
    
    // Source map 文件
    /\.map$/,
    
    // TypeScript 源文件和声明文件（生产环境不需要 .d.ts）
    /\.ts$/,
    /\.d\.ts$/,
    
    // 特定不需要的模块
    /\/onnxruntime-web\//,  // 使用 onnxruntime-node 即可
    /\/caniuse-lite\//,
    
    // 文档文件
    /\/README.*$/i,
    /\/CHANGELOG.*$/i,
    /\/HISTORY.*$/i,
    /\/LICENSE.*$/i,
    /\/LICENSE-MIT.*$/i,
    /\/LICENSE-ISC.*$/i,
    /\/COPYING.*$/i,
    /\/AUTHORS.*$/i,
    /\/CONTRIBUTORS.*$/i,
    /\.md$/,
    /\.markdown$/,
    /\.txt$/,
    
    // 配置文件
    /\.editorconfig$/,
    /\.eslintrc/,
    /\.prettierrc/,
    /\.babelrc/,
    /tsconfig\.json$/,
    /jsconfig\.json$/,
    /\.travis\.yml$/,
    /\.github\/workflows\//,
    /appveyor\.yml$/,
    /\.codecov\.yml$/,
    /\.nycrc/,
    /\.gitattributes$/,
    /\.gitignore$/,
    /\.npmignore$/,
    /\.eslintignore$/,
    /\.prettierignore$/,
    
    // transformers 的 web 版本和非 node 版本（Node.js 环境只需要 node.cjs 版本）
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.js$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.min\.js$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.web\.js$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.web\.min\.js$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.node\.min\.cjs$/,  // 使用非 min 版本
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.node\.mjs$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/transformers\.node\.min\.mjs$/,
    /\/node_modules\/@huggingface\/transformers\/dist\/ort-wasm-simd-threaded\.jsep\.mjs$/,
    
    // 移除 transformers 内部的重复依赖（这些在主 node_modules 中已存在）
    /\/node_modules\/@huggingface\/transformers\/node_modules\/chownr\//,
    /\/node_modules\/@huggingface\/transformers\/node_modules\/minipass\//,
    /\/node_modules\/@huggingface\/transformers\/node_modules\/minizlib\//,
    /\/node_modules\/@huggingface\/transformers\/node_modules\/onnxruntime-common\/dist\/umd\//,
  ];
  
  // 添加开发依赖的 ignore 规则
  for (const dep of devDependencies) {
    // 精确匹配
    patterns.push(new RegExp(`^\\/node_modules\\/${dep}$`));
    // 匹配该模块下的所有内容
    patterns.push(new RegExp(`^\\/node_modules\\/${dep}\\/`));
  }
  
  return patterns;
};

const config: ForgeConfig = {
  packagerConfig: {
    icon: path.join(__dirname, 'resources', 'images', 'icon'),
    asar: {
      unpack: '**/@img/sharp-darwin-arm64/lib/*.dylib,**/@huggingface/transformers/node_modules/onnxruntime-node/bin/**/*.dylib,**/@img/sharp-win32-x64/**/*.node',
    },
    extraResource: [
      path.join(__dirname, 'resources', 'models'),
    ],
    // 启用 prune 自动移除 devDependencies
    prune: true,
    // 额外的 ignore 规则
    ignore: createIgnorePatterns(),
    afterExtract: [
      (extractPath, electronVersion, platform, arch, callback) => {
        console.log("Extract path:", extractPath);
        callback();
      },
    ],
    afterCopy: [
      (buildPath, electronVersion, platform, arch, callback) => {
        console.log("Build path:", buildPath);
        
        // On macOS, copy sharp-libvips-darwin-arm64 to the build
        if (platform === 'darwin') {
          const imgDir = path.join(buildPath, 'node_modules/@img');
          const sharpLibvipsDir = path.join(imgDir, 'sharp-libvips-darwin-arm64');
          const sharpDir = path.join(imgDir, 'sharp-darwin-arm64');
          const sharpLibDir = path.join(sharpDir, 'lib');
          
          if (!fs.existsSync(sharpLibvipsDir)) {
            console.log('Copying sharp-libvips-darwin-arm64 to build...');
            const sourceDir = path.join(__dirname, 'node_modules/@img/sharp-libvips-darwin-arm64');
            
            if (fs.existsSync(sourceDir)) {
              fs.mkdirSync(imgDir, { recursive: true });
              
              const copyRecursive = (src: string, dest: string) => {
                const stat = fs.statSync(src);
                if (stat.isDirectory()) {
                  fs.mkdirSync(dest, { recursive: true });
                  for (const entry of fs.readdirSync(src)) {
                    copyRecursive(path.join(src, entry), path.join(dest, entry));
                  }
                } else {
                  fs.copyFileSync(src, dest);
                }
              };
              
              copyRecursive(sourceDir, sharpLibvipsDir);
              console.log('Copied sharp-libvips-darwin-arm64 to build');
            } else {
              console.warn('Source sharp-libvips-darwin-arm64 not found at:', sourceDir);
            }
          } else {
            console.log('sharp-libvips-darwin-arm64 already exists in build');
          }
          
          // Also copy libvips dylibs next to the sharp.node binary for simpler loading
          if (fs.existsSync(sharpLibvipsDir) && fs.existsSync(sharpLibDir)) {
            const libvipsSourceDir = path.join(sharpLibvipsDir, 'lib');
            if (fs.existsSync(libvipsSourceDir)) {
              const files = fs.readdirSync(libvipsSourceDir);
              for (const file of files) {
                if (file.endsWith('.dylib')) {
                  const sourceFile = path.join(libvipsSourceDir, file);
                  const destFile = path.join(sharpLibDir, file);
                  if (!fs.existsSync(destFile)) {
                    fs.copyFileSync(sourceFile, destFile);
                    console.log(`Copied ${file} to sharp-darwin-arm64/lib`);
                  }
                }
              }
            }
          }
          
          // Verify
          const libvipsLibPath = path.join(sharpLibvipsDir, 'lib/libvips-cpp.8.17.3.dylib');
          console.log('libvips library exists in sharp-libvips:', fs.existsSync(libvipsLibPath));
          const libvipsNextToSharp = path.join(sharpLibDir, 'libvips-cpp.8.17.3.dylib');
          console.log('libvips library next to sharp.node:', fs.existsSync(libvipsNextToSharp));
        }
        
        callback();
      },
    ],
    afterPrune: [
      (buildPath, electronVersion, platform, arch, callback) => {
        console.log('[afterPrune] Starting cleanup...');
        
        // Helper function to recursively delete files matching patterns
        const deleteMatchingFiles = (dir: string, patterns: RegExp[]) => {
          if (!fs.existsSync(dir)) return 0;
          let count = 0;
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              count += deleteMatchingFiles(fullPath, patterns);
            } else if (patterns.some(p => p.test(entry.name))) {
              fs.unlinkSync(fullPath);
              count++;
            }
          }
          return count;
        };

        // Helper function to recursively delete directories matching patterns
        const deleteMatchingDirs = (dir: string, patterns: RegExp[]) => {
          if (!fs.existsSync(dir)) return 0;
          let count = 0;
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              if (patterns.some(p => p.test(entry.name))) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                count++;
              } else {
                count += deleteMatchingDirs(fullPath, patterns);
              }
            }
          }
          return count;
        };

        // Clean up unnecessary files
        const nodeModulesDir = path.join(buildPath, 'node_modules');
        if (fs.existsSync(nodeModulesDir)) {
          // Delete TypeScript declaration files
          const dtsCount = deleteMatchingFiles(nodeModulesDir, [/\.d\.ts$/]);
          if (dtsCount > 0) console.log(`[afterPrune] Deleted ${dtsCount} .d.ts files`);

          // Delete documentation files
          const docPatterns = [/^README/i, /^CHANGELOG/i, /^HISTORY/i, /^LICENSE/i, /^COPYING/i, /^AUTHORS/i, /^CONTRIBUTORS/i, /\.md$/i];
          const docCount = deleteMatchingFiles(nodeModulesDir, docPatterns);
          if (docCount > 0) console.log(`[afterPrune] Deleted ${docCount} documentation files`);

          // Delete test directories
          const testDirPatterns = [/^test$/, /^tests$/, /^__tests__$/, /^spec$/, /^specs$/, /^benchmark$/, /^example$/, /^examples$/, /^demo$/, /^doc$/, /^docs$/];
          const testDirCount = deleteMatchingDirs(nodeModulesDir, testDirPatterns);
          if (testDirCount > 0) console.log(`[afterPrune] Deleted ${testDirCount} test/doc directories`);

          // Delete source map files
          const mapCount = deleteMatchingFiles(nodeModulesDir, [/\.map$/]);
          if (mapCount > 0) console.log(`[afterPrune] Deleted ${mapCount} source map files`);
        }

        // Delete transformers internal duplicate dependencies (use main node_modules versions instead)
        const transformersNodeModules = path.join(buildPath, 'node_modules/@huggingface/transformers/node_modules');
        if (fs.existsSync(transformersNodeModules)) {
          const duplicates = ['chownr', 'minipass', 'minizlib'];
          for (const dup of duplicates) {
            const dupPath = path.join(transformersNodeModules, dup);
            if (fs.existsSync(dupPath)) {
              fs.rmSync(dupPath, { recursive: true, force: true });
              console.log(`[afterPrune] Deleted duplicate ${dup} from transformers`);
            }
          }
        }

        // Delete protobufjs (only needed by onnxruntime-web which is excluded)
        const protobufjsPath = path.join(buildPath, 'node_modules/protobufjs');
        if (fs.existsSync(protobufjsPath)) {
          fs.rmSync(protobufjsPath, { recursive: true, force: true });
          console.log('[afterPrune] Deleted protobufjs (only needed by onnxruntime-web)');
        }

        // Delete @protobufjs (dependency of protobufjs)
        const protobufjsTypesPath = path.join(buildPath, 'node_modules/@protobufjs');
        if (fs.existsSync(protobufjsTypesPath)) {
          fs.rmSync(protobufjsTypesPath, { recursive: true, force: true });
          console.log('[afterPrune] Deleted @protobufjs (dependency of protobufjs)');
        }

        // Delete transformers src directory (only dist is needed at runtime)
        const transformersSrcPath = path.join(buildPath, 'node_modules/@huggingface/transformers/src');
        if (fs.existsSync(transformersSrcPath)) {
          fs.rmSync(transformersSrcPath, { recursive: true, force: true });
          console.log('[afterPrune] Deleted transformers/src (source files)');
        }

        // Delete transformers types directory
        const transformersTypesPath = path.join(buildPath, 'node_modules/@huggingface/transformers/types');
        if (fs.existsSync(transformersTypesPath)) {
          fs.rmSync(transformersTypesPath, { recursive: true, force: true });
          console.log('[afterPrune] Deleted transformers/types (type definitions)');
        }

        // Delete onnxruntime-node binaries for other platforms (only keep current platform)
        const onnxRuntimeBinPath = path.join(buildPath, 'node_modules/@huggingface/transformers/node_modules/onnxruntime-node/bin/napi-v3');
        if (fs.existsSync(onnxRuntimeBinPath)) {
          const platformDirs = fs.readdirSync(onnxRuntimeBinPath);
          for (const platformDir of platformDirs) {
            const platformPath = path.join(onnxRuntimeBinPath, platformDir);
            // Keep only darwin/arm64 for macOS ARM builds
            if (platformDir !== 'darwin' && fs.existsSync(platformPath)) {
              fs.rmSync(platformPath, { recursive: true, force: true });
              console.log(`[afterPrune] Deleted onnxruntime-node binaries for ${platformDir}`);
            } else if (platformDir === 'darwin') {
              // For darwin, only keep arm64 (remove x64)
              const darwinPath = platformPath;
              const x64Path = path.join(darwinPath, 'x64');
              if (fs.existsSync(x64Path)) {
                fs.rmSync(x64Path, { recursive: true, force: true });
                console.log('[afterPrune] Deleted onnxruntime-node binaries for darwin/x64');
              }
            }
          }
        }

        // Also clean up root onnxruntime-node if it exists
        const rootOnnxRuntimePath = path.join(buildPath, 'node_modules/onnxruntime-node/bin');
        if (fs.existsSync(rootOnnxRuntimePath)) {
          const entries = fs.readdirSync(rootOnnxRuntimePath);
          for (const entry of entries) {
            const entryPath = path.join(rootOnnxRuntimePath, entry);
            if (entry !== 'napi-v3' && fs.existsSync(entryPath)) {
              fs.rmSync(entryPath, { recursive: true, force: true });
              console.log(`[afterPrune] Deleted root onnxruntime-node/${entry}`);
            }
          }
          // Clean napi-v3 subdirectories for other platforms
          const napiV3Path = path.join(rootOnnxRuntimePath, 'napi-v3');
          if (fs.existsSync(napiV3Path)) {
            const platformDirs = fs.readdirSync(napiV3Path);
            for (const platformDir of platformDirs) {
              if (platformDir !== 'darwin') {
                const platformPath = path.join(napiV3Path, platformDir);
                if (fs.existsSync(platformPath)) {
                  fs.rmSync(platformPath, { recursive: true, force: true });
                  console.log(`[afterPrune] Deleted root onnxruntime-node/napi-v3/${platformDir}`);
                }
              } else {
                // For darwin, remove x64
                const x64Path = path.join(napiV3Path, 'darwin/x64');
                if (fs.existsSync(x64Path)) {
                  fs.rmSync(x64Path, { recursive: true, force: true });
                  console.log('[afterPrune] Deleted root onnxruntime-node/napi-v3/darwin/x64');
                }
              }
            }
          }
        }

        // Platform-specific cleanup
        if (platform === 'darwin') {
          // Fix sharp: fix rpath (copying is done in afterCopy)
          const sharpLibDir = path.join(buildPath, 'node_modules/@img/sharp-darwin-arm64/lib');
          const sharpNodePath = path.join(sharpLibDir, 'sharp-darwin-arm64.node');
          if (fs.existsSync(sharpNodePath)) {
            try {
              execSync(`install_name_tool -add_rpath "@loader_path/." "${sharpNodePath}"`, { stdio: 'ignore' });
              console.log('[afterPrune] Added @loader_path/. to sharp.node rpath');
            } catch (e) {
              console.log('[afterPrune] sharp.node rpath may already exist');
            }
          }
          
          // Fix onnxruntime-node: copy dylib next to binding.node and fix rpath
          const onnxBaseDir = path.join(buildPath, 'node_modules/@huggingface/transformers/node_modules/onnxruntime-node/bin/napi-v3/darwin/arm64');
          if (fs.existsSync(onnxBaseDir)) {
            const files = fs.readdirSync(onnxBaseDir);
            const nodeFile = files.find(f => f.endsWith('.node'));
            const dylibFile = files.find(f => f.endsWith('.dylib'));
            
            if (nodeFile && dylibFile) {
              const nodePath = path.join(onnxBaseDir, nodeFile);
              try {
                execSync(`install_name_tool -add_rpath "@loader_path/." "${nodePath}"`, { stdio: 'ignore' });
                console.log(`[afterPrune] Added @loader_path/. to ${nodeFile} rpath`);
              } catch (e) {
                console.log(`[afterPrune] ${nodeFile} rpath may already exist`);
              }
            }
          }
        }
        
        console.log('[afterPrune] Cleanup completed');
        callback();
      },
    ],

  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // Windows installer
      setupIcon: path.join(__dirname, 'resources', 'images', 'icon.ico'),
    }),
    new MakerDMG({
      icon: path.join(__dirname, 'resources', 'images', 'icon.icns'),
      format: 'ULFO'
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        icon: path.join(__dirname, 'resources', 'images', 'icon.png'),
      },
    }),
    new MakerDeb({
      options: {
        icon: path.join(__dirname, 'resources', 'images', 'icon.png'),
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
