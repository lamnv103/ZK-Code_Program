#!/bin/bash

echo "🚀 Setting up Circom for zkTransfer Balance Check..."

# Create directories
mkdir -p circuits
mkdir -p build
mkdir -p public/circuits

# Check if Circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ Circom not found. Please install Circom first."
    echo "📖 Installation guide: https://docs.circom.io/getting-started/installation/"
    exit 1
fi

echo "✅ Circom found: $(circom --version)"

# Compile the circuit
echo "🔧 Compiling BalanceCheck circuit..."
circom circuits/transfer.circom --r1cs --wasm --sym -o build/

if [ $? -ne 0 ]; then
    echo "❌ Circuit compilation failed!"
    exit 1
fi

echo "✅ Circuit compiled successfully!"

# Download Powers of Tau (if not exists)
if [ ! -f "build/powersOfTau28_hez_final_12.ptau" ]; then
    echo "📥 Downloading Powers of Tau ceremony file..."
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -P build/
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to download Powers of Tau file!"
        exit 1
    fi
fi

# Setup trusted setup
echo "🔐 Setting up trusted setup..."
snarkjs groth16 setup build/transfer.r1cs build/powersOfTau28_hez_final_12.ptau build/transfer_0000.zkey

# Contribute to ceremony (demo contribution)
echo "🤝 Contributing to ceremony..."
echo "zkTransfer Demo Contribution" | snarkjs zkey contribute build/transfer_0000.zkey build/circuit_final.zkey --name="zkTransfer Demo"

# Export verification key
echo "🔑 Exporting verification key..."
snarkjs zkey export verificationkey build/circuit_final.zkey verification_key.json

# Copy files to public directory for web access
echo "📁 Copying files to public directory..."
cp build/transfer.wasm public/circuits/
cp build/circuit_final.zkey public/circuits/
cp verification_key.json public/circuits/

# Install required npm packages
echo "📦 Installing required packages..."
npm install snarkjs circomlib ffjavascript

echo "🎉 Circom setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run: node scripts/generate-proof.js"
echo "2. Run: node test-circuit.js"
echo "3. Check generated files: build/proof.json, build/public.json"
echo "4. Integrate with your zkTransfer application"
echo ""
echo "📁 Generated files:"
echo "- build/transfer.wasm (Circuit WASM)"
echo "- build/circuit_final.zkey (Proving key)"
echo "- verification_key.json (Verification key)"
echo "- public/circuits/ (Web-accessible files)"
