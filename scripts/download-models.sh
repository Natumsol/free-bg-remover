#!/bin/bash

MODEL_DIR="resources/models/briaai/RMBG-1.4"
ONNX_DIR="$MODEL_DIR/onnx"

echo "📂 Creating model directories..."
mkdir -p "$ONNX_DIR"

echo "📥 Downloading config files..."
curl -L -o "$MODEL_DIR/config.json" https://huggingface.co/briaai/RMBG-1.4/resolve/main/config.json
curl -L -o "$MODEL_DIR/preprocessor_config.json" https://huggingface.co/briaai/RMBG-1.4/resolve/main/preprocessor_config.json

echo "📥 Downloading FP16 model (approx. 84MB)..."
curl -L -o "$ONNX_DIR/model_fp16.onnx" https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model_fp16.onnx

echo "✅ Done! Models are ready in $MODEL_DIR"
