import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        browserField: false,
        mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    build: {
        rollupOptions: {
            external: [
                'electron',
                ...builtinModules.flatMap(m => [m, `node:${m}`]),
                '@huggingface/transformers',
                'onnxruntime-node',
                'onnxruntime-common',
                'sharp',
                'better-sqlite3',
            ],
        },
        minify: 'esbuild',
        commonjsOptions: {
            ignoreDynamicRequires: true,
        },
    },
});
