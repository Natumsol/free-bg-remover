import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const config: ForgeConfig = {
  packagerConfig: {
    icon: path.join(__dirname, 'resources', 'images', 'icon'),
    asar: {
      unpack: '**/@img/sharp-darwin-arm64/lib/*.dylib,**/@huggingface/transformers/node_modules/onnxruntime-node/bin/**/*.dylib',
    },
    extraResource: [
      path.join(__dirname, 'resources', 'models'),
    ],
    ignore: [],
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
        if (platform === 'darwin') {
          // Fix sharp: copy libvips dylibs and fix rpath
          const sharpLibDir = path.join(buildPath, 'node_modules/@img/sharp-darwin-arm64/lib');
          const libvipsSourceDir = path.join(buildPath, 'node_modules/@img/sharp-libvips-darwin-arm64/lib');
          
          if (fs.existsSync(libvipsSourceDir) && fs.existsSync(sharpLibDir)) {
            const files = fs.readdirSync(libvipsSourceDir);
            for (const file of files) {
              if (file.endsWith('.dylib')) {
                const sourceFile = path.join(libvipsSourceDir, file);
                const destFile = path.join(sharpLibDir, file);
                fs.copyFileSync(sourceFile, destFile);
                console.log(`[afterPrune] Copied ${file} to sharp-darwin-arm64/lib`);
              }
            }
          }
          
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
        callback();
      },
    ],

  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // Windows installer
      setupIcon: path.join(__dirname, 'resources', 'images', 'icon.png'),
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
