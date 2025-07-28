# zkTransfer - Zero-Knowledge Proof Money Transfer System

A secure, privacy-preserving money transfer system built with Next.js, implementing zero-knowledge proofs for balance verification without revealing actual account balances.

## 🌟 Features

### 🔐 Zero-Knowledge Proof System
- **Complete Privacy**: User balances remain encrypted and hidden
- **Mathematical Verification**: Cryptographic proof of sufficient funds
- **No Balance Disclosure**: Prove you have enough money without revealing how much
- **Groth16 Implementation**: Production-ready zk-SNARK system
- **Circom Circuits**: Custom circuits for balance verification

### 💰 Core Functionality
- **Secure Transfers**: Send money with ZK proof verification
- **Balance Management**: Encrypted balance storage and management
- **Transaction History**: Complete transaction tracking with privacy
- **Multi-step Verification**: PIN + ZK proof authentication
- **Real-time Updates**: Live balance and transaction updates

### 👨‍💼 Admin Dashboard
- **ZK Proof Management**: Monitor and verify all proofs
- **Transaction Oversight**: Complete transaction management
- **User Administration**: User account and wallet management
- **System Monitoring**: Real-time system health and performance
- **Circuit Configuration**: ZK circuit parameter management

### 🛡️ Security Features
- **End-to-End Encryption**: All sensitive data encrypted
- **JWT Authentication**: Secure user authentication
- **PIN Protection**: Multi-factor authentication for transfers
- **Replay Protection**: Nullifier hashes prevent double-spending
- **Rate Limiting**: Protection against brute force attacks

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (configurable)
- **ZK Proofs**: Circom, snarkjs, Groth16
- **Encryption**: Custom encryption utilities
- **UI Components**: shadcn/ui component library

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Circom compiler
- snarkjs CLI tools

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-repo/zk-transfer.git
   cd zk-transfer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Configure your `.env.local`:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/zktransfer"
   JWT_SECRET="your-super-secret-jwt-key"
   ENCRYPTION_KEY="your-32-character-encryption-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

5. **Set up ZK circuits**
   \`\`\`bash
   chmod +x scripts/setup-circom.sh
   ./scripts/setup-circom.sh
   \`\`\`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 ZK Circuit Setup

The system uses custom Circom circuits for zero-knowledge proofs:

1. **Install Circom**
   \`\`\`bash
   npm install -g circom
   \`\`\`

2. **Compile circuits**
   \`\`\`bash
   cd circuits
   circom balance_check.circom --r1cs --wasm --sym
   \`\`\`

3. **Generate proving keys**
   \`\`\`bash
   snarkjs groth16 setup balance_check.r1cs powersOfTau28_hez_final_20.ptau circuit_final.zkey
   \`\`\`

4. **Export verification key**
   \`\`\`bash
   snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
   \`\`\`

## 📖 Usage

### For Users

1. **Register/Login**: Create account with email and secure password
2. **Deposit Funds**: Add money to your encrypted wallet
3. **Transfer Money**: 
   - Find recipient by email or wallet address
   - Enter transfer amount
   - System generates ZK proof of sufficient balance
   - Confirm with PIN
   - Transfer executed with privacy preserved
4. **View History**: Track all transactions with complete privacy

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Monitor ZK Proofs**: View and verify all zero-knowledge proofs
3. **Manage Transactions**: Oversee all system transactions
4. **User Management**: Administer user accounts and wallets
5. **System Configuration**: Configure ZK circuits and parameters

## 🔐 Zero-Knowledge Proof Flow

```mermaid
graph TD
    A[User Initiates Transfer] --> B[Generate ZK Proof]
    B --> C[Prove Sufficient Balance]
    C --> D[Submit Proof to Server]
    D --> E[Server Verifies Proof]
    E --> F{Proof Valid?}
    F -->|Yes| G[Execute Transfer]
    F -->|No| H[Reject Transfer]
    G --> I[Update Encrypted Balances]
    I --> J[Record Transaction]
    J --> K[Transfer Complete]
